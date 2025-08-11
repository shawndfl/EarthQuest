import { Component } from '../core/Component';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DialogComponent } from '../dialogs/DialogComponent';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';

export const defaultDialogDepth = -0.5;

export const MaxDialogCount = 5;

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

  async initialize(): Promise<void> {
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'dialogShader');
    this._projection = mat4.orthographic(0, this.eng.width, 0, this.eng.height, 1, -1, this._projection);
  }

  async loadLevel(): Promise<void> {
    const level = this.eng.levelData;
    this._menuTitle = this.eng.levelData.tiles.get('0F');
    if (!this._menuTitle) {
      console.error('Cannot find menu title');
      return;
    }

    // load all the textures
    this._texture = await level.waitForTextures();

    // setup the shader
    this._shader.setSpriteSheet(this._texture);

    //TODO get the correct texture for the tile.
    // Create a tile atlas
    // then create a level data that references the atlas

    const pos = new vec2(100, 300);
    const component = new DialogComponent(this.eng, this._menuTitle, this._texture);
    const quads = component.createQuad(pos, 200, 100, 1.0);

    this._quads.push(...quads);
    const geo = QuadGeometry.createQuad(this._quads);
    this._buffer.setBuffers(geo);
  }

  update(dt: number): void {
    this._shader.enable();

    const proj = this._projection;

    this._shader.setProj(proj);
    this._buffer.enable();

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;

    this.gl.depthFunc(this.gl.ALWAYS);
    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
    this.gl.depthFunc(this.gl.LEQUAL);
  }
}
