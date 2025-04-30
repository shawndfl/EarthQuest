import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { SpriteData } from '../environment/ILevelData2';
import vec2 from '../math/vec2';
import { TileManager } from '../systems/TileManager';
import * as MathConst from '../math/constants';
import mat2 from '../math/mat2';

/**
 * Base class for sprite controller. This can be the player, a simple animation, enemy, or some kind of game event trigger
 */
export abstract class SpriteController extends Component {
  /** Position in world space of the quad */
  private _position: vec2 = new vec2();
  private _depth: number = 0;
  private _rotate: number = 0;
  private _flipX: boolean;
  private _flipY: boolean;
  private _dirty: boolean;

  /** Size of the quad in world space */
  private _size: vec2 = new vec2();

  /** pixel position in the texture */
  private _sourcePixelOffset: vec2 = new vec2();
  private _sourcePixelSize: vec2 = new vec2();

  public get dirty(): boolean {
    return this._dirty;
  }

  public get position(): Readonly<vec2> {
    return this._position;
  }

  public get size(): Readonly<vec2> {
    return this._size;
  }

  public get sourcePixelOffset(): Readonly<vec2> {
    return this._sourcePixelOffset;
  }

  public get sourcePixelSize(): Readonly<vec2> {
    return this._sourcePixelSize;
  }

  public get depth(): number {
    return this._depth;
  }

  public get rotation(): number {
    return this._rotate;
  }
  public get flipX(): boolean {
    return this._flipX;
  }
  public get flipY(): boolean {
    return this._flipY;
  }

  constructor(eng: Engine, protected _tileManager: TileManager, protected _spriteData: SpriteData) {
    super(eng);
  }

  setPosition(x: number, y: number): void {
    this._position.x = x;
    this._position.y = y;
    this._dirty = true;
  }

  setSize(x: number, y: number): void {
    this._size.x = x;
    this._size.y = y;
    this._dirty = true;
  }

  setDepth(depth: number): void {
    this._depth = depth;
    this._dirty = true;
  }

  setFlip(flipX: boolean, flipY: boolean): void {
    this._flipX = flipX;
    this._flipY = flipY;
    this._dirty = true;
  }

  setRotation(degrees: number): void {
    this._rotate = degrees;
    this._dirty = true;
  }

  /**
   *Does this sprite controller take input
   * @returns
   */
  takesInput(): boolean {
    return false;
  }

  /**
   * Does this controller need to be updated in the main render loop
   * @returns
   */
  requiresUpdate(): boolean {
    return false;
  }

  /**
   * initialize
   */
  initialize(): void {
    this._position.x = this._spriteData.quad.min.x;
    this._position.y = this._spriteData.quad.min.y;
    this._depth = this._spriteData.quad.min.z;

    this._size.x = this._spriteData.quad.max.x - this._spriteData.quad.min.x;
    this._size.y = this._spriteData.quad.max.y - this._spriteData.quad.min.y;

    this._flipX = this._spriteData.flipX;
    this._flipY = this._spriteData.flipY;

    this._rotate = this._spriteData.rotate;

    // calculate the pixel offsets and size within the source texture
    const w = this._spriteData.texture.width;
    const h = this._spriteData.texture.height;
    this._sourcePixelOffset.x = this._spriteData.quad.minTex.x * w;
    this._sourcePixelOffset.y = (1 - this._spriteData.quad.minTex.y) * h;
    this._sourcePixelSize.x = this._spriteData.quad.maxTex.x * w - this._sourcePixelOffset.x;
    this._sourcePixelSize.y = (1 - this._spriteData.quad.maxTex.y) * h - this._sourcePixelOffset.y;

    this.calculateQuad();
  }

  /**
   * This will only be called if takesInput returns true
   * @param state
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    return false;
  }

  /**
   * Get the list of images from the sprite data
   * @returns
   */
  getImageNames(): string[] {
    return Object.keys(this._spriteData.images);
  }

  /**
   * Set an image by name
   * @param imageName
   */
  setImage(imageName: string): void {
    const image = this._spriteData.images[imageName];
    if (image) {
      let [x, y, w, h] = image.split(',').map((i) => Number.parseFloat(i));
      this._sourcePixelOffset.x = x;
      this._sourcePixelOffset.y = y;
      this._sourcePixelSize.x = w;
      this._sourcePixelSize.y = h;
    } else {
      console.error('Cannot find image "' + imageName + '" ');
    }
  }

  calculateQuad(quadIndex?: number) {
    const w = this._spriteData.texture.width;
    const h = this._spriteData.texture.height;
    let minX = this.sourcePixelOffset.x / w;
    let minY = 1.0 - this.sourcePixelOffset.y / h;
    let maxX = (this.sourcePixelOffset.x + this.sourcePixelSize.x) / w;
    let maxY = 1.0 - (this.sourcePixelOffset.y + this.sourcePixelSize.y) / h;

    // get the quad we want to change
    let quad = this._spriteData.quad;
    if (quadIndex != null) {
      quad = this._spriteData.otherQuads[quadIndex];
    }

    // flipping uvs
    if (this.flipX && this.flipY) {
      quad.minTex.x = maxX;
      quad.minTex.y = maxY;
      quad.maxTex.x = minX;
      quad.maxTex.y = minY;
    } else if (this.flipX) {
      quad.minTex.x = maxX;
      quad.minTex.y = minY;
      quad.maxTex.x = minX;
      quad.maxTex.y = maxY;
    } else if (this.flipY) {
      quad.minTex.x = minX;
      quad.minTex.y = maxY;
      quad.maxTex.x = maxX;
      quad.maxTex.y = minY;
    } else {
      quad.minTex.x = minX;
      quad.minTex.y = minY;
      quad.maxTex.x = maxX;
      quad.maxTex.y = maxY;
    }

    // convert to screen space, min is the top left corner
    quad.min.x = this.position.x;
    quad.min.y = this.position.y;
    quad.min.z = this.depth;

    const spriteWidth = this.size.x;
    const spriteHeight = this.size.y;

    // max is the bottom right
    quad.max.x = quad.min.x + spriteWidth;
    quad.max.y = quad.min.y + spriteHeight;
    quad.max.z = this.depth;

    // if we have some rotation then apply it
    if (this.rotation != null) {
      // we will need four points for this
      if (!quad.points) {
        quad.points = [new vec2(), new vec2(), new vec2(), new vec2()];
      }

      const centerX = this.size.x / 2;
      const centerY = this.size.y / 2;
      quad.points[0].x = -centerX;
      quad.points[0].y = centerY;

      quad.points[1].x = centerX;
      quad.points[1].y = centerY;

      quad.points[2].x = centerX;
      quad.points[2].y = -centerY;

      quad.points[3].x = -centerX;
      quad.points[3].y = -centerY;
      console.debug('before rotation');
      quad.points.forEach((p, i) => console.debug('  point ' + i + ': ' + p.x.toFixed(2) + ', ' + p.y.toFixed(2)));

      const rotation = new mat2();
      rotation.setIdentity();
      rotation.rotate(MathConst.toRadian(this.rotation));

      // rotate and translate all points
      quad.points.forEach((p, i) => {
        p.multiplyMat2(rotation);
        console.debug('  point rotate    : ' + i + ': ' + p.x.toFixed(2) + ', ' + p.y.toFixed(2));
        p.x += centerX;
        p.y += centerY;
        p.add(quad.min);
        console.debug('  point translate : ' + i + ': ' + p.x.toFixed(2) + ', ' + p.y.toFixed(2));
      });

      console.debug('  min: ' + quad.min.x.toFixed(2) + ', ' + quad.min.y.toFixed(2));
      console.debug('  max: ' + quad.max.x.toFixed(2) + ', ' + quad.max.y.toFixed(2));
    }
  }

  update(dt: number): void {}
}
