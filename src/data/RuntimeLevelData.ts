import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { DrawingLayer } from '../drawingLayers/DrawingLayer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import { toRadian } from '../math/constants';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { ITileData, TileOrigin } from './ITileAtlas';

export interface SourceImageOptions {
  flipX?: boolean;
  flipY?: boolean;
  alpha?: number;
  hueRotation?: number;
}

export interface TriggerCollision {
  triggerName: string;
  collisionPolygon: vec2[];
}

/**
 * Wraps all the json tile data in a controller so it can dynamically change
 */
export class RuntimeTileData extends Component {
  /**
   * Position in pixels of the source image. This is used in calculating the correct uv coordinates
   * in the texture.
   * use setSourceLocation() to set this.
   */
  private _sourcePosition: vec2;
  /**
   * Size in pixels of the source image. Mostly 8x8. This is used in calculating the correct uv coordinates
   * in the texture.
   * use setSourceLocation() to set this.
   */
  private _sourceSize: vec2;

  /**
   * Tile size that is used in calculating the transform of the quad.
   * Use setTileTransform() to set it.
   */
  private _tileSize: vec2;
  /**
   * Tile position that is used in calculating the transform of the quad
   * Use setTileTransform() to set it.
   */
  private _tilePosition: vec3;
  /**
   * Rotation in degrees that is used in calculating the transform of the quad
   * Use setTileTransform() to set it.
   */
  private _rotation: number = 0;

  private _collisionOffset: vec4;
  private _collisionPolygon: vec2[];
  private _triggerCollision: TriggerCollision[];

  /**
   * name mapped to a x,y,w,h pixel location in the texture
   */
  private _images: Map<string, vec4>;
  /** texture offset that is used in calculating the uvTransform of the quad */
  private _uvOffset: vec2;
  /** texture scale that is used in calculating the uvTransform of the quad */
  private _uvScale: vec2;

  /** The quad that gets rendered by the drawing layer */
  protected _quad: Quad;

  get texture(): Texture {
    return this._drawingLayer.texture;
  }

  /**
   * The tile data from the tile atlas. The tile atlas comes from the
   * drawing layer
   */
  protected _tileData: ITileData;

  /**
   * get the drawing layer
   */
  get drawingLayer(): DrawingLayer {
    return this._drawingLayer;
  }

  /**
   * This quad should be changed by the
   */
  get quad(): Readonly<Quad> {
    return this._quad;
  }

  get uuid(): string {
    return this._quad.uuid;
  }
  get width(): number {
    return this._quad.width;
  }
  get height(): number {
    return this._quad.height;
  }
  get hueAngle(): number {
    return this._quad.hueAngle;
  }
  get alpha(): number {
    return this._quad.alpha;
  }
  get transform(): Readonly<mat4> {
    return this._quad.transform;
  }
  get depthBias(): number {
    return this._quad.depthBias;
  }
  get uvTransform(): Readonly<mat3> {
    return this._quad.uvTransform;
  }
  get mirrorX(): boolean {
    return this._quad.mirrorX;
  }
  get mirrorY(): boolean {
    return this._quad.mirrorY;
  }
  get offset(): vec2 {
    return this._quad.offset;
  }

  set uuid(value: string) {
    this._quad.uuid = value;
    this.drawingLayer.requestRefresh();
  }
  set width(value: number) {
    this._quad.width = value;
    this.drawingLayer.requestRefresh();
  }
  set height(value: number) {
    this._quad.height = value;
    this.drawingLayer.requestRefresh();
  }
  set hueAngle(value: number) {
    this._quad.hueAngle = value;
    this.drawingLayer.requestRefresh();
  }
  set alpha(value: number) {
    this._quad.alpha = value;
    this.drawingLayer.requestRefresh();
  }
  set transform(value: Readonly<mat4>) {
    this._quad.transform ??= value?.copy();
    this.drawingLayer.requestRefresh();
  }
  set depthBias(value: number) {
    this._quad.depthBias = value;
    this.drawingLayer.requestRefresh();
  }
  set uvTransform(value: Readonly<mat3>) {
    this._quad.uvTransform ??= value?.copy();
    this.drawingLayer.requestRefresh();
  }
  set mirrorX(value: boolean) {
    this._quad.mirrorX = value;
    this.drawingLayer.requestRefresh();
  }
  set mirrorY(value: boolean) {
    this._quad.mirrorY = value;
    this.drawingLayer.requestRefresh();
  }
  set offset(value: vec2) {
    this._quad.offset = value;
    this.drawingLayer.requestRefresh();
  }

  public get visible(): boolean {
    return !this.quad.hidden;
  }

  public set visible(value: boolean) {
    this._quad.hidden = !value;
    this.drawingLayer.requestRefresh();
  }

  public get name(): string {
    return this._name;
  }

  public get sourcePosition(): Readonly<vec2> {
    return this._sourcePosition;
  }

  public get sourceSize(): Readonly<vec2> {
    return this._sourceSize;
  }

  public get tilePosition(): Readonly<vec3> {
    return this._tilePosition;
  }

  public get tileSize(): Readonly<vec2> {
    return this._tileSize;
  }

  public get collisionOffset(): Readonly<vec4> {
    return this._collisionOffset;
  }

  get collisionPolygon(): vec2[] {
    return this._collisionPolygon;
  }

  get tileData(): Readonly<ITileData> {
    return this._tileData;
  }

  get images(): Readonly<Map<string, vec4>> {
    return this._images;
  }

  getImageNames(): string[] {
    return Array.from(this._images.keys());
  }

  /**
   * Create a sprite for rendering to a drawing layer.
   * @param eng
   * @param _name
   * @param _tileDataId
   * @param _drawingLayer
   */
  constructor(
    eng: Engine,
    private _name: string,
    private readonly _tileDataId: string,
    protected _drawingLayer: DrawingLayer
  ) {
    super(eng);

    this._tileData = _drawingLayer.tileAtlas.tiles[this._tileDataId];

    if (!this._tileData) {
      console.error('Cannot find tile data for ' + _tileDataId);
    }

    if (!this.texture) {
      console.debug('No texture for drawing layer');
    }

    // initialize the quad that is used in rendering
    this._quad = {
      uuid: this._name,
      width: eng.pixelScale, // this will match the size of the canvas pixel scale
      height: eng.pixelScale, // this will match the size of the canvas pixel scale
      offset: new vec2(),
      transform: new mat4().setIdentity(),
      uvTransform: new mat3().setIdentity(),
      mirrorX: this._tileData.flipX,
      mirrorY: this._tileData.flipY,
      alpha: this._tileData.alpha ?? 1,
      depthBias: 0,
      hueAngle: this._tileData.hueRotation ?? 0,
    };

    // make sure the drawing layer knows about this quad
    this.drawingLayer.registerQuad(this);

    this._images = new Map();
    const point = this.getLocationFromString(this._tileData.sourceLocation);
    this._collisionOffset = this.getLocationFromString(this._tileData.collisionOffset);
    this._collisionPolygon = this._tileData.collisionPolygon?.map((p) => this.getVec2FromString(p));
    this._triggerCollision = this._tileData.collisionTrigger?.map((p) => {
      return {
        triggerName: p.triggerName,
        collisionPolygon: p.collisionPolygon.map((p2) => this.getVec2FromString(p2)),
      };
    });

    // setup source location
    this._sourcePosition = new vec2(point.x, point.y);
    this._sourceSize = new vec2(point.z, point.w);
    this._uvScale = new vec2(point.z / this.texture.width, point.w / this.texture.height);
    this._uvOffset = new vec2(point.x / this.texture.width, 1 - this._uvScale.y - point.y / this.texture.height);

    // set up tile location
    this._tileSize = new vec2(
      this._tileData.tileWidth ?? this.sourceSize.x ?? 8,
      this._tileData.tileHeight ?? this.sourceSize.y ?? 8
    );

    this._tilePosition = new vec3(0, 0, 0);

    // set the origin of the tile.
    this.offset = new vec2(0, 0);
    switch (this._tileData.origin) {
      case TileOrigin.Center:
        this.offset.x = 0;
        this.offset.y = 0;
        break;
      case TileOrigin.BottomLeft:
      default:
        this.offset.x = this.eng.pixelScale / 2;
        this.offset.y = this.eng.pixelScale / 2;
    }

    // add in all the images
    if (this._tileData.images) {
      Object.keys(this._tileData.images).forEach((k) => {
        const point = this.getLocationFromString(this._tileData.images[k]);
        this._images.set(k, point);
      });
    }

    // apply the transformations to the quad
    this.updateQuad();
  }

  /**
   * Sets an image for a quad using the tile data images.
   * @param name
   */
  setImage(name: string, options?: SourceImageOptions): void {
    const imageLoc = this.images.get(name);
    if (imageLoc) {
      this.setSourceLocation(imageLoc, options);
    } else {
      console.error('cannot find image ' + name);
    }
  }

  /**
   * Sets the uv location for the quad.
   * This will change the source image location on the texture.
   * @param location - x,y,w,h in pixels of the texture.
   */
  setSourceLocation(location: vec4, options?: SourceImageOptions): void {
    this._sourcePosition = new vec2(location.x, location.y);
    this._sourceSize = new vec2(location.z, location.w);
    this._uvScale = new vec2(location.z / this.texture.width, location.w / this.texture.height);
    this._uvOffset = new vec2(location.x / this.texture.width, 1 - this._uvScale.y - location.y / this.texture.height);
    this.mirrorX = options?.flipX;
    this.mirrorY = options?.flipY;
    this.alpha ??= options?.alpha;
    this.hueAngle ??= options?.hueRotation;
    this.updateQuad();
  }

  /**
   * Sets the position of scale and offset of a quad. Only the values provided are set
   * @param position - position in pixels
   * @param tileSize - tile size - default is the tileSize of this object
   * @param offset - Offset - default is bottom left corner. See QuadGeometry
   */
  setTileTransform(options: {
    position?: vec3;
    tileSize?: vec2;
    offset?: vec2;
    rotation?: number;
    depthBias?: number;
  }): void {
    const { position, tileSize, offset, rotation, depthBias } = options;

    if (position) {
      this._tilePosition.x = position.x;
      this._tilePosition.y = position.y;
      this._tilePosition.z = position.z;
    }

    if (depthBias !== undefined) {
      this.depthBias = depthBias;
    }

    if (tileSize) {
      this._tileSize.x = tileSize.x;
      this._tileSize.y = tileSize.y;
    }

    // offset quad so that the bottom left is the anchor point instead of the center
    if (offset) {
      this._quad.offset.x = offset.x;
      this._quad.offset.y = offset.y;
    }

    if (rotation !== undefined) {
      this._rotation = rotation;
    }
    this.updateQuad();
  }

  /**
   * Updates the quad with the uv and transform data.
   */
  private updateQuad(): void {
    this.transform.setIdentity();
    this.transform.scale(this.tileSize);
    this.transform.rotate(toRadian(this._rotation), vec3.forward);
    this.transform.translate(this.tilePosition);

    this.uvTransform.setIdentity();
    this.uvTransform.scale(this._uvScale);
    this.uvTransform.setTranslation(this._uvOffset);

    // request refresh from the drawing layer because we changed something
    this.drawingLayer.requestRefresh();
  }

  /**
   * Parses the location from a string
   * @param location
   * @returns
   */
  getLocationFromString(location: string): vec4 {
    if (!location) {
      return new vec4();
    }
    const components = location?.split(',');
    const point = new vec4(0, 0, 0, 0);
    let i = 0;
    try {
      point.x = parseFloat(components[i++]);
      point.y = parseFloat(components[i++]);
      point.z = parseFloat(components[i++]);
      point.w = parseFloat(components[i++]);
    } catch (e) {
      console.error('Cannot parse ' + location + ' expecting [x,y] or [x,y,z,w]');
    }

    return point;
  }

  /**
   * Parses the location from a string
   * @param location
   * @returns
   */
  getVec2FromString(location: string): vec2 {
    if (!location) {
      return new vec2();
    }
    const components = location?.split(',');
    const point = new vec2();
    let i = 0;
    try {
      point.x = parseFloat(components[i++]);
      point.y = parseFloat(components[i++]);
    } catch (e) {
      console.error('Cannot parse ' + location + ' expecting [x,y] or [x,y');
    }

    return point;
  }
}
