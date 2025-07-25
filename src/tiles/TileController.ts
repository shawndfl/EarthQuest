import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { TileData } from '../data/ILevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';

export interface TileControllerOptions {
  quad: Quad;
  tileData: TileData;
  sourceTexture: Texture;
  buffer: GlBuffer;
}

/**
 * This is a base class for managing a tile.
 */
export abstract class TileController extends Component {
  /**
   * The texture applied to this quad
   */
  public get texture(): Texture {
    return this.options.sourceTexture;
  }
  /**
   * The quad that will be managed by this tile controller.
   */
  public get quad(): Quad {
    return this.options.quad;
  }

  /**
   * The tile data that describes how this controller should behave
   */
  public get tileData(): TileData {
    return this.options.tileData;
  }

  constructor(eng: Engine, protected options: TileControllerOptions) {
    super(eng);
  }

  /**
   * Initialize the controller
   * @param quad
   * @param tileData
   */
  abstract initialize(): Promise<void>;

  /**
   * Perform an updates for this tile
   * @param dt
   */
  abstract update(dt: number): void;
}
