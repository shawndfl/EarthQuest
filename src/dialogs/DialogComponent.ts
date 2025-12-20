import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import { clamp } from '../math/constants';
import { Curve, CurveType } from '../math/Curve';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { SceneType } from '../scenes/SceneType';
import { UserAction } from '../systems/InputManager';

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

  protected alpha: number;
  protected position: vec2;
  protected text: string;
  protected id: string;
  protected _visible: boolean;
  protected isHiding: boolean;
  protected fontColor: vec4;

  protected openCurve: Curve;

  get isVisible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine, tileData: RuntimeTileData, texture: Texture) {
    super(eng);
    this.tileData = tileData;
    this.texture = texture;
    this._buffer = new GlBuffer(this.gl);

    this._quads = [];
    for (let i = 0; i < 9; i++) {
      this._quads.push(this.defaultQuad());
    }
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
        const size = this.eng.textManager.getTextSize(this.text);
        const yPosition = this.eng.height - this.position.y - this.height + size.height;
        this.eng.textManager.setTextBlock({
          id: this.id,
          text: this.text,
          color: this.fontColor,
          position: new vec2(this.position.x, yPosition),
          scale: 1.0,
          depth: -1,
        });
      }
    };
  }

  setText(id: string, text: string, x: number, y: number, color: vec4): void {
    this.id = id;
    this.text = text;
    this.fontColor = color.copy();
  }

  show(pos: vec2, width: number, height: number, alpha: number = 1.0): void {
    this.position = pos;
    this.originalWidth = width;
    this.originalHeight = height;
    this.alpha = alpha;
    this._visible = true;
    this.isHiding = false;
    this.openCurve.reverse(false);
    this.openCurve.start(true);
  }

  hide(): void {
    this.isHiding = true;
    this.eng.textManager.hideText(this.id);
    this.openCurve.reverse(true);
    this.openCurve.start(true);
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
    this.openCurve.update(dt);

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
  handleInput(): void {
    if (this.eng.inputManager.isReleased(UserAction.A)) {
      this.hide();
      this.eng.inputManager.clearRelease();
      this.eng.loadScene(SceneType.HomeBattle1);
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
