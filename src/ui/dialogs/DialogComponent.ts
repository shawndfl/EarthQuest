import { Component } from '../../core/Component';
import { Engine } from '../../core/Engine';
import { RuntimeTileData } from '../../data/RuntimeLevelData';
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
import { DialogOptions } from './DialogOptions';
import { TextIterator } from './TextIterator';

/** used to wait for user acknowledge */
export const TextReturn = '\x0a';
/** list user option */
export const TextTab = '\x09';

/**
 * Creates the quads that make up the dialog box.
 */
export class DialogComponent extends Component {
  protected _quads: Quad[] = [];
  private _buffer: GlBuffer;
  protected tileData: RuntimeTileData;
  protected texture: Texture;
  protected width: number;
  protected height: number;
  protected originalWidth: number;
  protected originalHeight: number;
  protected pixelBorderThickness: number = 10;
  protected alpha: number;
  protected position: vec2;
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

  get isVisible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine, tileData: RuntimeTileData, texture: Texture) {
    super(eng);
    this.tileData = tileData;
    this.texture = texture;
    this._buffer = new GlBuffer(this.gl);

    this.textIterator = new TextIterator();

    this._quads = [];
    for (let i = 0; i < 9; i++) {
      this._quads.push(this.defaultQuad());
    }

    this.setupTextAnimation();
    this.setupOpenAnimation();
  }

  protected setupTextAnimation(): void {
    this.textCurve = new Curve();
    this.textCurve.points([
      { p: 0, t: 0 },
      { p: 1, t: 100 },
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
      for (let option of result.Options) {
        this.text += '   ' + option + '\n';
      }

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
        this._visible = false;
      } else {
        this.textIterator.initialize(this.fullText);
        this.textCurve.start(true);
      }
    };
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

  protected updateText(): void {}

  updateDialogQuad(): void {
    this.createTopRightQuad(this._quads[0]);
    this.createTopQuad(this._quads[1]);
    this.createTopLeftQuad(this._quads[2]);

    this.createLeftQuad(this._quads[3]);
    this.createCenterQuad(this._quads[4]);
    this.createRightQuad(this._quads[5]);

    this.createBottomQuad(this._quads[6]);
    this.createBottomLeftQuad(this._quads[7]);
    this.createBottomRightQuad(this._quads[8]);

    const geo = QuadGeometry.createQuad(this._quads);
    this._buffer.setBuffers(geo);
  }

  update(dt: number): void {
    if (!this.isVisible) {
      return;
    }
    this.updateText();

    this.openCurve.update(dt);
    this.textCurve.update(dt);

    this._buffer.enable();

    const geo = QuadGeometry.createQuad(this._quads);
    this._buffer.setBuffers(geo);

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;

    this.gl.depthFunc(this.gl.ALWAYS);
    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
    this.gl.depthFunc(this.gl.LEQUAL);

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

  protected createCenterQuad(dest: Quad): Quad {
    const width = this.width - 16;
    const height = this.height - 16;
    const imageName = 'center';
    const offset = new vec2(this.width / 2, this.height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest, 0.8);
  }

  protected createTopLeftQuad(dest: Quad): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'top:left';
    const offset = new vec2(width / 2, this.height - height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createTopRightQuad(dest: Quad): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'top:right';
    const offset = new vec2(this.width - width / 2, this.height - height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }
  protected createBottomRightQuad(dest: Quad): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'bottom:right';
    const offset = new vec2(this.width - width / 2, height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createBottomLeftQuad(dest: Quad): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'bottom:left';
    const offset = new vec2(width / 2, height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createLeftQuad(dest: Quad): Quad {
    const width = 8;
    const height = this.height - 16;
    const imageName = 'center:left';
    const offset = new vec2(width / 2, height / 2 + width);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createTopQuad(dest: Quad): Quad {
    const width = this.width - 16;
    const height = 8;
    const imageName = 'top:center';
    const offset = new vec2(width / 2 + 8, this.height - 8 / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createBottomQuad(dest: Quad): Quad {
    const width = this.width - 16;
    const height = 8;
    const imageName = 'bottom:center';
    const offset = new vec2(width / 2 + 8, height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createRightQuad(dest: Quad): Quad {
    const width = 8;
    const height = this.height - 16;
    const imageName = 'center:right';
    const offset = new vec2(this.width - width / 2, height / 2 + 8);

    return this.createQuadImp(width, height, imageName, offset, dest);
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
    dest?: Quad,
    alpha: number = 1.0
  ): Quad {
    if (!dest) {
      dest = this.defaultQuad();
    }

    dest.width = width;
    dest.height = height;
    dest.offset.set(offset);
    dest.mirrorX = false;
    dest.mirrorY = false;
    dest.alpha = alpha;
    dest.hueAngle = 0;

    const pos = this.position;

    dest.transform.setIdentity();
    dest.transform.translate(new vec3(pos.x, pos.y, 0));
    dest.transform.scale(vec3.one);

    const sourceLocation = this.tileData.images.get(imageName);

    const scaleX = sourceLocation.z / this.texture.width;
    const scaleY = sourceLocation.w / this.texture.height;
    const offsetU = sourceLocation.x / this.texture.width;
    const offsetV = sourceLocation.y / this.texture.height;

    dest.uvTransform.setIdentity();
    dest.uvTransform.scale(new vec2(scaleX, scaleY));
    dest.uvTransform.setTranslation(new vec2(offsetU, 1 - scaleY - offsetV));

    return dest;
  }
}
