import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { ITileAtlas } from '../data/ITileAtlas';
import { RuntimeTileData } from '../data/RuntimeLevelData';

import { GlBuffer } from '../graphics/GlBuffer';
import { QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';

import mat4 from '../math/mat4';
import { BaseShader } from '../shaders/BaseShader';

import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { IQuadSorter } from './IQuadSorter';
import { QuadHeightSorter } from './QuadHeightSorter';

/**
 * This will manage a collection of quads and draw them in one draw call
 */
export class DrawingLayer extends Component {
  /** texture for all the quads */
  protected _texture: Texture;
  /** buffer used to draw the quads */
  protected _buffer: GlBuffer;
  /** shader used in drawing this */
  protected _shader: SpritePerspectiveShader;
  /** This is what we are drawing */
  protected _tileControllers: Map<string, RuntimeTileData> = new Map();
  /** atlas used to look up the textures */
  protected _tileAtlas: ITileAtlas;
  /** Should the buffer be updated by the the _quads */
  protected _refreshGeometry: boolean;

  protected sorter: IQuadSorter;

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
    this.sorter = this.createQuadSorter();
  }

  protected createShader(): BaseShader {
    return this.eng.spritePerspectiveShader;
  }

  /**
   * Register a quad to draw
   * @param quad
   */
  registerQuad(tile: RuntimeTileData): void {
    this._tileControllers.set(tile.uuid, tile);
    this._refreshGeometry = true;
  }

  createQuadSorter(): IQuadSorter {
    return new QuadHeightSorter();
  }

  /**
   * The projection matrix for this view
   * @returns
   */
  protected getProjection(): Readonly<mat4> {
    return this.eng.viewManager.projection;
  }

  /**
   * Remove a quad from the drawing queue
   * @param uuid
   */
  unregister(uuid: string): void {
    if (this._tileControllers.has(uuid)) {
      this._tileControllers.delete(uuid);
      this._refreshGeometry = true;
    }
  }

  /**
   * Create the tiles
   */
  async loadLevel(): Promise<void> {
    this._tileControllers.clear();
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
      const quads = Array.from(this._tileControllers.values()).filter((tile) => !tile.quad.hidden);
      const geo = QuadGeometry.createQuad(
        quads.map((tile) => tile.quad),
        this.sorter
      );
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

    const proj = this.getProjection();

    this._shader.setProj(proj);
    this._buffer.enable();

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;

    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
  }
}
