import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { ITileAtlas } from '../data/ITileAtlas';

import { GlBuffer } from '../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';

import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';

export class DrawingLayer extends Component {
  private _texture: Texture;
  private _buffer: GlBuffer;
  private _shader: SpritePerspectiveShader;
  /** This is what we are drawing */
  private _quads: Quad[];
  private _tileAtlas: ITileAtlas;
  private _refreshGeometry: boolean;

  public get texture(): Texture {
    return this._texture;
  }

  public get tileAtlas(): ITileAtlas {
    return this._tileAtlas;
  }

  public get buffer(): GlBuffer {
    return this._buffer;
  }

  constructor(eng: Engine, private _atlasId: string) {
    super(eng);
    this._tileAtlas = this.eng.assetManager.atlasData[_atlasId];
  }

  registerQuad(quad: Quad): void {
    this._quads.push(quad);
  }

  unregister(uuid: string): void {
    const i = this._quads.findIndex((q) => q.uuid == uuid);
    if (i > -1) {
      this._quads.splice(i);
    }
  }

  /**
   * Create the tiles
   */
  async loadLevel(): Promise<void> {
    this._quads = [];
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'scene');
    this._texture = await this.eng.assetManager.getTexture(this._tileAtlas.texture);
    this._shader.setSpriteSheet(this._texture);

    this._refreshGeometry = true;
  }

  requestRefresh(): void {
    this._refreshGeometry = true;
  }

  protected refreshGeometry(): void {
    if (this._refreshGeometry) {
      // set the openGL buffers
      const geo = QuadGeometry.createQuad(this._quads);
      this._buffer.setBuffers(geo);

      this._refreshGeometry = false;
    }
  }

  update(dt: number): void {
    this.refreshGeometry();

    this._shader.enable();

    const proj = this.eng.viewManager.projection;

    this._shader.setProj(proj);
    this._buffer.enable();

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;

    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
  }
}
