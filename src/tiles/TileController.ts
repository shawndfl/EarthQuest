import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { CollisionResults } from '../data/CollisionResults';
import { CollisionTypes } from '../data/CollisionTypes';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import { clamp } from '../math/constants';
import mat3 from '../math/mat3';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { DrawingLayer } from '../systems/DrawingLayer';

export interface TileControllerOptions {
  quad: Quad;
  tileData: RuntimeTileData;
  sourceTexture: Texture;
  buffer: GlBuffer;
  drawingLayer: DrawingLayer;
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
  protected _quadBottomLeft: vec3 = new vec3();

  get collision(): Readonly<rect> {
    return this._collision;
  }

  get bottomLeft(): vec3 {
    this.quad.transform.getTranslation(this._quadBottomLeft);
    return this._quadBottomLeft;
  }
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
   * type of tile this is
   */
  public get type(): string {
    return this.options.tileData.data.type;
  }

  /**
   * tile name
   */
  public get id(): string {
    return this.options.tileData.data.id;
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

  requestGeometryRefresh(): void {
    this.options.drawingLayer.requestRefresh();
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
   * Get the location from a csv string. Should be in the format of [x,y,width,height]
   * @param location
   * @returns
   */
  protected getLocationFromString(location: string): vec4 {
    const point = new vec4();
    try {
      const components = location.split(',');
      let i = 0;

      point.x = parseFloat(components[i++]);
      point.y = parseFloat(components[i++]);
      point.z = parseFloat(components[i++]);
      point.w = parseFloat(components[i++]);
    } catch (e) {
      console.error('Cannot parse "' + location + '" expecting [x,y,z,w]');
    }

    return point;
  }

  /**
   * Updates the transform matrix, updates collision, request refresh
   * @param offset - vector 3 translation relative to the current translation. if null will just update the collision box.
   */
  setTranslation(offset?: vec3): void {
    if (offset) {
      this.quad.transform.translate(offset);
    }
    this.updateCollision();

    this.options.drawingLayer.requestRefresh();
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
    source.setTranslation(newPos);
  }

  /**
   * gets the latest bottom left and creates a collision box around the tileSize
   */
  updateCollision(): void {
    this.quad.transform.getTranslation(this.bottomLeft);
    this._collision.left = this.bottomLeft.x;
    this._collision.width = this.tileData.tileSize.x * this.eng.pixelScale;
    this._collision.height = this.tileData.tileSize.y * this.eng.pixelScale;
    this._collision.top = this.bottomLeft.y + this._collision.height;
  }

  /**
   * Sets an image for a quad using the tile data images.
   * @param name
   */
  setImage(name: string, flipX?: boolean, flipY?: boolean): void {
    const imageLoc = this.options.tileData.data.images?.[name];
    if (imageLoc) {
      this.activeImage = name;
      const texture = this.options.sourceTexture;
      const [sourcePixelX, sourcePixelY, sourcePixelWidth, sourcePixelHeight] =
        this.getLocationFromString(imageLoc).xyzw;
      const uvTransform = new mat3();
      const scaleX = sourcePixelWidth / texture.width;
      const scaleY = sourcePixelHeight / texture.height;
      const offsetU = sourcePixelX / texture.width;
      const offsetV = sourcePixelY / texture.height;

      // save the new source data
      this.options.tileData.sourcePosition.x = sourcePixelX;
      this.options.tileData.sourcePosition.y = sourcePixelY;
      this.options.tileData.sourceSize.x = sourcePixelWidth;
      this.options.tileData.sourceSize.y = sourcePixelHeight;

      uvTransform.setIdentity();
      uvTransform.scale(new vec2(scaleX, scaleY));
      uvTransform.setTranslation(new vec2(offsetU, 1 - scaleY - offsetV));
      this.quad.uvTransform = uvTransform;
      this.quad.mirrorX = flipX;
      this.quad.mirrorY = flipY;
      this.options.drawingLayer.requestRefresh();
    } else {
      console.error('cannot find image ' + name);
    }
  }
}
