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
  requestBufferRefresh: (tileController: TileController) => void;
}

/**
 * This is a base class for managing a tile.
 */
export abstract class TileController extends Component {
  /**
   * The collision rect of the tile.
   */
  protected _collision: rect = new rect();
  /**
   * This is the bottom left corner of the tile.
   */
  public get bottomLeft(): Readonly<vec3> {
    return this.tileData.tilePosition;
  }

  get collision(): Readonly<rect> {
    return this._collision;
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
    this.setPosition(translation.add(this.bottomLeft));
  }

  /**
   * Sets the tile transform
   * @param position
   */
  setPosition(position: vec3): void {
    this.setTileTransform({ position });
    this.updateCollision();
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
  abstract initialize(): Promise<void>;

  /**
   * Perform an updates for this tile
   * @param dt
   */
  abstract update(dt: number): void;

  /**
   * Draw the collision shape
   */
  drawCollision(color?: vec4): void {
    if (!color) {
      this.eng.debugHelpers.removeRect(this.uuid);
      return;
    }

    if (this.tileData.collisionShape == CollisionShape.Full) {
      this.eng.debugHelpers.setRect(this.uuid, this._collision, color);
    }
  }

  /**
   * Alow others to respond to this collision
   * @param results
   */
  collisionResponse(results: CollisionResults): void {
    for (let tileController of results.intersectingTiles) {
      tileController.onCollision(results.source);
    }
  }

  /**
   * Each controller can handle how to respond to the collision.
   * Default is push it out.
   * @param source
   */
  onCollision(source: TileController): void {
    // by default just push out the source tile
    this.pushOut(source);
  }

  pushOut(source: TileController, speed: number = 0.01): void {
    let distToLeft = source._collision.right - this._collision.left;
    let distToRight = this._collision.right - source._collision.left;
    let distToTop = this._collision.top - source._collision.bottom;
    let distToBottom = source._collision.top - this._collision.bottom;

    distToLeft = distToLeft < 0 ? 0 : distToLeft;
    distToRight = distToRight < 0 ? 0 : distToRight;
    distToTop = distToTop < 0 ? 0 : distToTop;
    distToBottom = distToBottom < 0 ? 0 : distToBottom;

    let deltaX = distToLeft < distToRight ? -distToLeft : distToRight;
    let deltaY = distToTop < distToBottom ? distToTop : -distToBottom;

    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      deltaY = 0;
    } else {
      deltaX = 0;
    }
    const dir = new vec3(deltaX, deltaY, 0);
    const newPos = dir.scale(0.5);
    console.debug('pushing out ' + source.type + ' ' + newPos.x.toFixed(5) + ', ' + newPos.y.toFixed(5));
    source.setTileTransform({ position: newPos });
  }

  /**
   * gets the latest bottom left and creates a collision box around the tileSize
   */
  updateCollision(): void {
    this.quad.transform.getTranslation(this.bottomLeft);
    this._collision.left = this.bottomLeft.x + this.tileData.collisionOffset.x;
    this._collision.width = (this.tileData.tileSize.x + this.tileData.collisionOffset.z) * this.eng.pixelScale;
    this._collision.height = (this.tileData.tileSize.y + +this.tileData.collisionOffset.w) * this.eng.pixelScale;
    this._collision.top = this.bottomLeft.y + this._collision.height + this.tileData.collisionOffset.y;
  }

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
