import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DrawingLayer } from '../drawingLayers/DrawingLayer';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';

/**
 * Everything you need to know about a tile and how it's drawn
 */
export interface TileControllerOptions {
  tileDataId: string;
  initializePosition?: vec3;
  drawingLayer: DrawingLayer;
}

/**
 * This is a base class for managing a tile.
 */
export abstract class TileController extends RuntimeTileData {
  /**
   * This is the bottom left corner of the tile.
   */
  public get bottomLeft(): Readonly<vec3> {
    return this.tilePosition;
  }

  /**
   * type of this tile
   */
  public get type(): string {
    return this.tileData.type;
  }

  /**
   * The image passed into setImage
   */
  protected activeImage: string;

  constructor(eng: Engine, name: string, options: TileControllerOptions) {
    super(eng, name, options.tileDataId, options.drawingLayer);
    this.setPosition(options.initializePosition?.copy());
  }

  /**
   * Translates the tile ( adding to its current position ).
   * @param translation
   */
  setTranslation(translation: vec3): void {
    this.setPosition(translation.copy().add(this.bottomLeft));
  }

  /**
   * Sets the tile transform
   * @param position
   */
  setPosition(position: vec3): void {
    this.setTileTransform({ position });
  }

  /**
   * Offsets the position so that it appears higher
   * @param offset
   */
  setPositionOffset(offset: vec2): void {
    this.setTileTransform({ offset });
  }

  abstract initialize(): Promise<void>;
  /**
   * Perform an updates for this tile
   * @param dt
   */
  abstract update(dt: number): void;
}
