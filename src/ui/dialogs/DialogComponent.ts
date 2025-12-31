import { Component } from '../../core/Component';
import { Engine } from '../../core/Engine';
import { RuntimeTileData } from '../../data/RuntimeLevelData';
import { DrawingLayer } from '../../drawingLayers/DrawingLayer';
import { GlBuffer } from '../../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../../graphics/QuadGeometry';
import { Texture } from '../../graphics/Texture';
import { clamp } from '../../math/constants';
import { Curve, CurveType } from '../../math/Curve';
import mat3 from '../../math/mat3';
import mat4 from '../../math/mat4';
import vec2 from '../../math/vec2';
import vec3 from '../../math/vec3';
import vec4 from '../../math/vec4';

import { UserAction } from '../../systems/InputManager';
import { DialogIcon } from './DialogIcon';
import { DialogOptions } from './DialogOptions';
import { ListBox } from './ListBox';
import { TextIterator } from './TextIterator';

/** used to wait for user acknowledge */
export const TextReturn = '\x0C';
/** list user option */
export const TextTab = '\x09';

/**
 * Creates the quads that make up the dialog box.
 */
export class DialogComponent extends Component {
  protected _cursor: RuntimeTileData;
  protected listbox: ListBox;
  protected _id: string;

  protected _textSpeedPerCharacterInMs = 60;

  protected readonly TileId = 'Dialog Menu';

  protected tileData: Map<string, RuntimeTileData> = new Map();
  protected texture: Texture;
  protected width: number;
  protected height: number;
  protected originalWidth: number;
  protected originalHeight: number;
  protected pixelBorderThickness: number = 10;
  protected alpha: number;
  protected position: vec3;
  protected fullText: string;
  protected text: string;
  protected textPadding: number;
  protected fontScale: number;
  protected id: string;
  protected _visible: boolean;
  protected isHiding: boolean;
  protected fontColor: vec4;
  protected textIterator: TextIterator;

  protected dialogOptions: DialogOptions;

  protected openCurve: Curve;
  protected textCurve: Curve;
  protected cursorCurve: Curve;

  get drawingLayer(): DrawingLayer {
    return this.eng.dialogManager.drawingLayer;
  }

  get isVisible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine) {
    super(eng);
    this._id = this.eng.random.getUuid();

    this.setupTextAnimation();
    this.setupOpenAnimation();
  }

  protected createIcons(): void {
    if (!this._cursor) {
      const id = this.id + '_' + 'cursor';
      this._cursor = new RuntimeTileData(this.eng, id, this.TileId, this.drawingLayer);
      this._cursor.setImage('icon1');
      // start out hidden
      this._cursor.visible = false;
      this.tileData.set(id, this._cursor);
    }
  }

  /**
   * This will print one character at a time
   */
  protected setupTextAnimation(): void {
    this.textIterator = new TextIterator();
    this.textCurve = new Curve();
    this.textCurve.points([
      { p: 0, t: 0 },
      { p: 1, t: this._textSpeedPerCharacterInMs },
    ]);
    this.textCurve.repeat(-1);

    this.textCurve.curve(CurveType.discreet);

    this.textCurve.onUpdate = (value) => {
      const result = this.textIterator.next();

      if (!result) {
        return;
      }

      // if we are just waiting for the user
      if (result.pauseForUser) {
        return;
      }
      const yPosition =
        this.eng.height - this.position.y - this.height + this.pixelBorderThickness * 2 + (this.textPadding ?? 0);
      const xPosition = this.position.x + this.pixelBorderThickness + (this.textPadding ?? 0);

      this.text += result.character;
      result.Options.forEach((option, i, a) => {
        this.text += '    ' + option + (i < a.length - 1 ? '\n' : '');
      });

      if (result.Options.length > 0) {
        this._cursor.visible = true;
        const pos = this.position.copy();
        pos.x += 10;
        pos.y += 10;
        pos.z = -0.5;
        this._cursor.setTileTransform({
          position: pos,
        });
      }

      this.text = this.shiftTextLines(this.text);

      this.eng.textManager.setTextBlock({
        id: this.id,
        text: this.text,
        color: this.fontColor,
        position: new vec2(xPosition, yPosition),
        scale: this.fontScale,
        depth: -1,
      });
    };
  }

  get maxLinesInDialog(): number {
    const innerHeight = this.height - this.pixelBorderThickness * 2;
    return innerHeight / this.eng.textManager.lineHeight;
  }

  private shiftTextLines(text: string): string {
    let lineCount = (text.match(/\n/g) || []).length + 1;
    if (text.endsWith('\n')) {
      lineCount--;
    }
    if (lineCount > this.maxLinesInDialog) {
      let startIndex = text.length - 1;
      lineCount = 0;

      // go backwards until we get the max lines
      for (let i = text.length - 1; i >= 0; i--) {
        if (text.at(i) == '\n') {
          lineCount++;
          if (lineCount >= this.maxLinesInDialog) {
            // add one to remove the new line we just came across
            startIndex = i + 1;
            break;
          }
        }
      }
      const corrected = text.substring(startIndex);
      return corrected;
    }

    return text;
  }

  /**
   * This will open and close the dialog box
   */
  protected setupOpenAnimation(): void {
    this.openCurve = new Curve();
    this.openCurve.points([
      { p: 0, t: 0 },
      { p: 1, t: 150 },
      { p: 2, t: 200 },
      { p: 3, t: 300 },
    ]);

    this.openCurve.curve(CurveType.linear);
    this.openCurve.onUpdate = (value) => {
      this.width = clamp(value * this.originalWidth, 16, this.originalWidth);
      this.height = clamp((value - 1) * this.originalHeight, 16, this.originalHeight);
      this.updateDialogQuad();
    };
    this.openCurve.onDone = () => {
      if (this.isHiding) {
        this.hideDialog();
      } else {
        this.textIterator.initialize(this.fullText);
        this.textCurve.start(true);
      }
    };
  }

  /**
   * Hide the 9 dialog tiles and icons
   */
  private hideDialog(): void {
    this._visible = false;
    this.tileData.forEach((v, _) => {
      v.visible = false;
    });
  }

  /**
   *
   * @param dialogOptions show the dialog
   */
  show(dialogOptions: DialogOptions): void {
    this.dialogOptions = dialogOptions;
    this.id = dialogOptions.id;
    this.fullText = dialogOptions.text;
    this.text = '';
    this.textPadding = dialogOptions.textPadding;
    this.fontColor = dialogOptions.color.copy();
    this.fontScale = dialogOptions.fontScale;

    this.position = dialogOptions.position.copy();
    this.originalWidth = dialogOptions.width;
    this.originalHeight = dialogOptions.height;
    this._visible = true;
    this.isHiding = false;
    this.openCurve.reverse(false);
    this.openCurve.start(true);
    this.textIterator.initialize(this.text);
  }

  hide(): void {
    this.isHiding = true;
    this.eng.textManager.hideText(this.id);
    this._cursor.visible = false;
    this.openCurve.reverse(true);
    this.openCurve.start(true);
    this.textCurve.pause(0);

    if (this.dialogOptions.onClose) {
      this.dialogOptions.onClose('');
    }
  }

  protected defaultQuad(): Quad {
    return {
      uuid: this.eng.random.getUuid(),
      width: 0,
      height: 0,
      // offset quad to the  center
      offset: new vec2(),
      transform: mat4.identity,
      uvTransform: mat3.identity,
      mirrorX: false,
      mirrorY: false,
      alpha: 1.0,
      hueAngle: 0,
      depthBias: 0,
    };
  }

  updateDialogQuad(): void {
    const drawingLayer = this.eng.dialogManager.drawingLayer;

    this.createIcons();

    drawingLayer.registerQuad(this.createTopRightQuad());
    drawingLayer.registerQuad(this.createTopQuad());
    drawingLayer.registerQuad(this.createTopLeftQuad());

    drawingLayer.registerQuad(this.createLeftQuad());
    drawingLayer.registerQuad(this.createCenterQuad());
    drawingLayer.registerQuad(this.createRightQuad());

    drawingLayer.registerQuad(this.createBottomQuad());
    drawingLayer.registerQuad(this.createBottomLeftQuad());
    drawingLayer.registerQuad(this.createBottomRightQuad());

    // icons
  }

  update(dt: number): void {
    if (!this.isVisible) {
      return;
    }

    this.openCurve.update(dt);
    this.textCurve.update(dt);

    this.handleInput();
  }

  /**
   * Processes user input
   */
  protected handleInput(): void {
    if (this.eng.inputManager.isReleased(UserAction.A)) {
      if (this.textIterator.isDone()) {
        this.hide();
      }
      this.textIterator.acknowledge();

      this.eng.inputManager.clearRelease();
    }
  }

  protected createCenterQuad(): RuntimeTileData {
    const width = this.width - 16;
    const height = this.height - 16;
    const imageName = 'center';
    const offset = new vec2(this.width / 2, this.height / 2);
    return this.createQuadImp(width, height, imageName, offset, 0.8);
  }

  protected createTopLeftQuad(): RuntimeTileData {
    const width = 8;
    const height = 8;
    const imageName = 'top:left';
    const offset = new vec2(width / 2, this.height - height / 2);
    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createTopRightQuad(): RuntimeTileData {
    const width = 8;
    const height = 8;
    const imageName = 'top:right';
    const offset = new vec2(this.width - width / 2, this.height - height / 2);
    return this.createQuadImp(width, height, imageName, offset);
  }
  protected createBottomRightQuad(): RuntimeTileData {
    const width = 8;
    const height = 8;
    const imageName = 'bottom:right';
    const offset = new vec2(this.width - width / 2, height / 2);
    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createBottomLeftQuad(): RuntimeTileData {
    const width = 8;
    const height = 8;
    const imageName = 'bottom:left';
    const offset = new vec2(width / 2, height / 2);
    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createLeftQuad(): RuntimeTileData {
    const width = 8;
    const height = this.height - 16;
    const imageName = 'center:left';
    const offset = new vec2(width / 2, height / 2 + width);
    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createTopQuad(): RuntimeTileData {
    const width = this.width - 16;
    const height = 8;
    const imageName = 'top:center';
    const offset = new vec2(width / 2 + 8, this.height - 8 / 2);
    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createBottomQuad(): RuntimeTileData {
    const width = this.width - 16;
    const height = 8;
    const imageName = 'bottom:center';
    const offset = new vec2(width / 2 + 8, height / 2);
    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createRightQuad(): RuntimeTileData {
    const width = 8;
    const height = this.height - 16;
    const imageName = 'center:right';
    const offset = new vec2(this.width - width / 2, height / 2 + 8);
    return this.createQuadImp(width, height, imageName, offset);
  }

  /**
   * Creates a quad with the given inputs.
   * @param width
   * @param height
   * @param imageName
   * @param offset
   * @param dest - target quad if null one will be created
   * @param alpha - transparency of the quad
   * @returns
   */
  protected createQuadImp(
    width: number,
    height: number,
    imageName: string,
    offset: vec2,
    alpha: number = 1.0
  ): RuntimeTileData {
    const tileId = 'Dialog Menu';
    const tile = new RuntimeTileData(this.eng, this.id + '_' + imageName, tileId, this.drawingLayer);
    tile.setTileTransform({
      position: this.position,
      offset: offset,
      tileSize: new vec2(1, 1),
    });
    tile.setImage(imageName);

    tile.width = width;
    tile.height = height;
    tile.offset.set(offset);
    tile.mirrorX = false;
    tile.mirrorY = false;
    tile.alpha = alpha;
    tile.hueAngle = 0;

    // save for later
    this.tileData.set(imageName, tile);

    return tile;
  }
}
