import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { CollisionShape, ITileData, TileOrigin } from './ITileAtlas';

export interface SourceImageOptions {
  flipX?: boolean;
  flipY?: boolean;
  alpha?: number;
  hueRotation?: number;
}

export class RuntimeTileData extends Component {
  /**
   * Position in pixels of the source image
   */
  private _sourcePosition: vec2;
  /**
   * Size in pixels of the source image. Mostly 8x8
   */
  private _sourceSize: vec2;

  private _uuid: string;

  private _tileSize: vec2;
  private _tilePosition: vec3;
  private _collisionOffset: vec4;
  private _tileOffset: vec2;
  private _worldTransform = new mat4();

  /**
   * The id of the controller
   */
  public get uuid(): string {
    return this._uuid;
  }

  /**
   * name mapped to a x,y,w,h pixel location in the texture
   */
  private _images: Map<string, vec4>;
  private _uvOffset: vec2;
  private _uvScale: vec2;
  private _uvTransform = new mat3();
  private _flipX: boolean;
  private _flipY: boolean;
  private _alpha: number;
  private _hueRotation: number;

  private _quad: Quad;

  public get name(): string {
    return this._name;
  }

  public get quad(): Quad {
    return this._quad;
  }

  public get tileOffset(): Readonly<vec2> {
    return this._tileOffset;
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

  get collisionShape(): CollisionShape {
    return this._tileData.collisionShape ?? CollisionShape.Full;
  }

  get data(): Readonly<ITileData> {
    return this._tileData;
  }

  get texture(): Texture {
    return this._texture;
  }

  get images(): Readonly<Map<string, vec4>> {
    return this._images;
  }

  getImageNames(): string[] {
    return Array.from(this._images.keys());
  }

  constructor(eng: Engine, private _name: string, private readonly _tileData: ITileData, private _texture: Texture) {
    super(eng);

    // create an id for this
    this._uuid = this.eng.random.getUuid();

    this._images = new Map();
    const point = this.getLocationFromString(this._tileData.sourceLocation);
    this._collisionOffset = this.getLocationFromString(this._tileData.collisionOffset);

    // setup source location
    this._sourcePosition = new vec2(point.x, point.y);
    this._sourceSize = new vec2(point.z, point.w);
    this._uvScale = new vec2(point.z / _texture.width, point.w / _texture.height);
    this._uvOffset = new vec2(point.x / _texture.width, 1 - this._uvScale.y - point.y / _texture.height);
    this._flipX = this._tileData.flipX;
    this._flipY = this._tileData.flipY;
    this._alpha = this._tileData.alpha ?? 1;
    this._hueRotation = this._tileData.hueRotation ?? 0;

    // set up tile location
    this._tileSize = new vec2(
      this._tileData.tileWidth ?? this.sourceSize.x ?? 8,
      this._tileData.tileHeight ?? this.sourceSize.y ?? 8
    );
    this._tilePosition = new vec3(0, 0, 0);

    // set the origin of the tile.
    this._tileOffset = new vec2(0, 0);
    switch (this._tileData.origin) {
      case TileOrigin.Center:

      case TileOrigin.BottomLeft:
      default:
        this._tileOffset.x = this.eng.pixelScale / 2;
        this._tileOffset.y = this.eng.pixelScale / 2;
    }

    // add in all the images
    if (this._tileData.images) {
      Object.keys(this._tileData.images).forEach((k) => {
        const point = this.getLocationFromString(this._tileData.images[k]);
        this._images.set(k, point);
      });
    }

    this._quad = {
      uuid: this.uuid,
      width: eng.pixelScale,
      height: eng.pixelScale,
      offset: this._tileOffset,
      transform: this._worldTransform,
      uvTransform: this._uvTransform,
      mirrorX: this.data.flipX,
      mirrorY: this.data.flipY,
      alpha: this.data.alpha ?? 1,
      hueAngle: 0,
    };
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
    this._uvScale = new vec2(location.z / this._texture.width, location.w / this._texture.height);
    this._uvOffset = new vec2(
      location.x / this._texture.width,
      1 - this._uvScale.y - location.y / this._texture.height
    );
    this._flipX = options?.flipX;
    this._flipY = options?.flipY;
    this._alpha ??= options?.alpha;
    this._hueRotation ??= options?.hueRotation;
    this.updateQuad();
  }

  /**
   * Sets the position of scale and offset of a quad. Only the values provided are set
   * @param position - position in pixels
   * @param tileSize - tile size - default is the tileSize of this object
   * @param offset - Offset - default is bottom left corner. See QuadGeometry
   */
  setTileTransform(options: { position?: vec3; tileSize?: vec2; offset?: vec2 }): void {
    const { position, tileSize, offset } = options;

    if (position) {
      this._tilePosition.x = position.x;
      this._tilePosition.y = position.y;
      this._tilePosition.z = position.z;
    }

    if (tileSize) {
      this._tileSize.x = tileSize.x;
      this._tileSize.y = tileSize.y;
    }

    // offset quad so that the bottom left is the anchor point instead of the center
    if (offset) {
      this._tileOffset.x = offset.x;
      this._tileOffset.y = offset.y;
    }
    this.updateQuad();
  }

  /**
   * Updates the quad with the uv and transform data.
   */
  private updateQuad(): void {
    this._worldTransform.setIdentity();
    this._worldTransform.translate(this.tilePosition);
    this._worldTransform.scale(this.tileSize);

    this._uvTransform.setIdentity();
    this._uvTransform.scale(this._uvScale);
    this._uvTransform.setTranslation(this._uvOffset);

    // create a quad
    const width = this.eng.pixelScale; // this will match the size of the canvas pixel scale
    const height = this.eng.pixelScale;

    this._quad.width = width;
    this._quad.height = height;
    this._quad.offset = this._tileOffset;
    this._quad.transform = this._worldTransform;
    this._quad.uvTransform = this._uvTransform;
    this._quad.mirrorX = this._flipX;
    this._quad.mirrorY = this._flipY;
    this._quad.alpha = this._alpha ?? 1;
    this._quad.hueAngle = this._hueRotation;
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
    const point = new vec4([0, 0, 0, 0]);
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
}
