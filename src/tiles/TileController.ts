import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { CollisionResults } from '../data/CollisionResults';
import { CollisionTypes } from '../data/CollisionTypes';
import { CollisionShape } from '../data/ITileAtlas';
import { RuntimeTileData, SourceImageOptions } from '../data/RuntimeLevelData';
import { DrawingLayer } from '../drawingLayers/DrawingLayer';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import { clamp } from '../math/constants';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';

/**
 * Everything you need to know about a tile and how it's drawn
 */
export interface TileControllerOptions {
  tileData: RuntimeTileData;
  initializePosition?: vec3;
  requestBufferRefresh: (tileController: TileController) => void;
}

/**
 * This is a base class for managing a tile.
 */
export abstract class TileController extends Component {
  /**
   * This is the bottom left corner of the tile.
   */
  public get bottomLeft(): Readonly<vec3> {
    return this.tileData.tilePosition;
  }

  /**
   * The texture applied to this quad
   */
  public get texture(): Texture {
    return this.tileData.texture;
  }

  /**
   * The id of the controller
   */
  public get uuid(): string {
    return this.tileData.uuid;
  }

  /**
   * The quad that will be managed by this tile controller.
   */
  public get quad(): Quad {
    return this.tileData.quad;
  }

  /**
   * type of this tile
   */
  public get type(): string {
    return this.tileData.data.type;
  }

  /**
   * tile name
   */
  public get name(): string {
    return this.tileData.name;
  }

  /**
   * The tile data that describes how this controller should behave
   */
  public get tileData(): RuntimeTileData {
    return this.options.tileData;
  }

  /**
   * The image passed into setImage
   */
  protected activeImage: string;

  constructor(eng: Engine, protected options: TileControllerOptions) {
    super(eng);
  }

  /**
   * Sets the uv location for the quad.
   * This will change the source image location on the texture.
   * @param location - x,y,w,h in pixels of the texture.
   */
  setSourceLocation(
    location: vec4,
    options: {
      flipX: boolean;
      flipY: boolean;
      alpha: number;
      hueRotation: number;
    }
  ): void {
    this.tileData.setSourceLocation(location, options);
    this.requestGeometryRefresh();
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
   * Sets the position of scale and offset of a quad. Only the values provided are set
   * @param position - position in pixels
   * @param tileSize - tile size - default is the tileSize of this object
   * @param offset - Offset - default is bottom left corner. See QuadGeometry
   */
  setTileTransform(options: { position?: vec3; tileSize?: vec2; offset?: vec2 }): void {
    this.tileData.setTileTransform(options);
    this.requestGeometryRefresh();
  }

  /**
   * Initialize the controller
   * @param quad
   * @param tileData
   */
  async initialize(): Promise<void> {
    this.setPosition(this.options.initializePosition ?? new vec3());
  }

  /**
   * Perform an updates for this tile
   * @param dt
   */
  abstract update(dt: number): void;

  /**
   * Sets an image for a quad using the tile data images.
   * @param name
   */
  setImage(name: string, options?: SourceImageOptions): void {
    this.activeImage = name;
    this.tileData.setImage(name, options);
    this.requestGeometryRefresh();
  }

  /**
   * tells the drawing layer we need to update something
   */
  protected requestGeometryRefresh(): void {
    if (this.options.requestBufferRefresh) {
      this.options.requestBufferRefresh(this);
    }
  }
}
