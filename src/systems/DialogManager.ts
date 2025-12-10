import { Component } from '../core/Component';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DialogComponent } from '../dialogs/DialogComponent';
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
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';

export const defaultDialogDepth = -0.5;

export const MaxDialogCount = 5;

//TODO
// Support multiple dialog
// support options
// Print character at a time
// input to continue
// menu for status
// menu for equip
// menu for items
// menu for help

/**
 * Manages dialog boxes
 */
export class DialogManager extends Component {
  private _buffer: GlBuffer;
  private _texture: Texture;
  private _menuTitle: RuntimeTileData;
  private _shader: SpritePerspectiveShader;
  private _quads: Quad[] = []; // should be 32 X 29 For a screen of 128/225
  protected _projection: mat4;

  protected openCurve: Curve;

  async initialize(): Promise<void> {
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'dialogShader');
    this._projection = mat4.orthographic(0, this.eng.width, 0, this.eng.height, 1, -1, this._projection);
    this.openCurve = new Curve();
  }

  async loadLevel(): Promise<void> {
    this.eng.textManager.setTextBlock({
      id: 'player',
      text: 'It works!',
      color: new vec4([0.4, 0.4, 0.7, 1]),
      position: new vec2([this.eng.width / 2, 50]),
      scale: 1.0,
      depth: -1,
    });

    const name = 'Dialog Menu';
    const tileAtlas = this.eng.assetManager.atlasData['default'];
    const tileData = tileAtlas.tiles[name];
    this._texture = await this.eng.assetManager.getTexture(tileAtlas.texture);
    this._menuTitle = new RuntimeTileData(this.eng, name, tileData, this._texture);

    if (!this._menuTitle) {
      console.error('Cannot find menu title');
      return;
    }

    // setup the shader
    this._shader.setSpriteSheet(this._texture);

    const pos = new vec2(100, 300);
    const component = new DialogComponent(this.eng, this._menuTitle, this._texture);
    const quads = component.createQuad(pos, 200, 100, 1.0);

    this.openCurve.points([
      { p: 0, t: 0 },
      { p: 1, t: 150 },
      { p: 2, t: 300 },
      { p: 3, t: 1200 },
    ]);
    this.openCurve.curve(CurveType.linear);
    this.openCurve.repeat(-1);
    this.openCurve.pingPong(true);
    this.openCurve.start(true, undefined, (value) => {
      const w = clamp(value * 200, 16, 200);
      const h = clamp((value - 1) * 100, 16, 100);
      component.createQuad(pos, w, h, 1.0);
      const geo = QuadGeometry.createQuad(this._quads);
      this._buffer.setBuffers(geo);
    });

    this._quads.push(...quads);
    const geo = QuadGeometry.createQuad(this._quads);
    this._buffer.setBuffers(geo);
  }

  show(): void {}

  update(dt: number): void {
    this._shader.enable();

    const proj = this._projection;

    this._shader.setProj(proj);
    this._buffer.enable();

    this.openCurve.update(dt);

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;

    this.gl.depthFunc(this.gl.ALWAYS);
    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
    this.gl.depthFunc(this.gl.LEQUAL);
  }
}
