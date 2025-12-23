import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { ITileAtlas } from '../data/ITileAtlas';

import { GlBuffer } from '../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';

import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';

/**
 * This will manage a collection of quads and draw them in one draw call
 */
export class DrawingLayer extends Component {
  protected _texture: Texture;
  protected _buffer: GlBuffer;
  protected _shader: SpritePerspectiveShader;
  /** This is what we are drawing */
  protected _quads: Quad[];

  protected _tileAtlas: ITileAtlas;
  /** Should the buffer be updated by the the _quads */
  protected _refreshGeometry: boolean;

  /**
   * Get the texture assigned to this layer
   */
  public get texture(): Texture {
    return this._texture;
  }

  /**
   * Atlas used to look up sprites with in this texture
   */
  public get tileAtlas(): ITileAtlas {
    return this._tileAtlas;
  }

  public get buffer(): GlBuffer {
    return this._buffer;
  }

  constructor(eng: Engine, private _atlasId: string) {
    super(eng);
    this._tileAtlas = this.eng.assetManager.atlasData[this._atlasId];
  }

  /**
   * Register a quad to draw
   * @param quad
   */
  registerQuad(quad: Quad): void {
    this._quads.push(quad);
    this._refreshGeometry = true;
  }

  /**
   * Remove a quad from the drawing queue
   * @param uuid
   */
  unregister(uuid: string): void {
    const i = this._quads.findIndex((q) => q.uuid == uuid);
    if (i > -1) {
      this._quads.splice(i);
      this._refreshGeometry = true;
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

  /**
   * If the client updates a quad call this to queue a buffer refresh
   */
  requestRefresh(): void {
    this._refreshGeometry = true;
  }

  /**
   * Refresh the geometry if required
   */
  protected refreshGeometry(): void {
    if (this._refreshGeometry) {
      // set the openGL buffers
      const geo = QuadGeometry.createQuad(this._quads);
      this._buffer.setBuffers(geo);

      this._refreshGeometry = false;
    }
  }

  /**
   * Draw the quads
   * @param dt
   */
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
