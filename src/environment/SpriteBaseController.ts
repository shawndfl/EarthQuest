import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import { ISpriteData } from '../core/ISpriteData';
import { Sprite, SpriteFlip } from '../core/Sprite';
import { Texture } from '../core/Texture';
import mat4 from '../math/mat4';
import vec4 from '../math/vec4';
import { ISpriteController } from './ISprintController';

/**
 * This class controls a sprite's position and scale
 * given a sprite sheet and some json data that holds the
 * sprite offset and size in pixels.
 */
export abstract class SpritBaseController
  extends Component
  implements ISpriteController
{
  protected _spriteData: ISpriteData[];
  protected _spriteTexture: Texture;
  protected _buffer: GlBuffer;
  protected _selectedSpriteIndex: number;
  protected _selectedSpriteId: string;

  abstract get sprite(): Sprite;

  get rotation(): number {
    return this.sprite.rotation;
  }

  protected get buffer() {
    return this._buffer;
  }

  get selectedSpriteIndex() {
    return this._selectedSpriteIndex;
  }

  get selectedSpriteId(): string {
    return this._selectedSpriteId;
  }

  get spriteCount(): number {
    return this._spriteData.length;
  }

  constructor(eng: Engine) {
    super(eng);
    this._spriteData = [];
    this._selectedSpriteIndex = 0;
  }

  /**
   * setup the sprite
   * @param texture
   * @param spriteData
   */
  initialize(
    texture: Texture,
    spriteData: ISpriteData[],
    defaultSprite?: string | number
  ) {
    // save the data
    this._spriteData = spriteData;

    // create the gl buffers for this sprite
    this._buffer = new GlBuffer(this.gl);

    // setup the shader for the sprite
    this._spriteTexture = texture;
  }

  /**
   * Gets the list of all the sprites
   * @returns
   */
  getSpriteList(): string[] {
    const idList: string[] = [];
    this._spriteData.forEach((sprite) => idList.push(sprite.id));
    return idList;
  }

  /**
   * Sets the sprites position
   * @param x in screen pixels
   * @param y in screen pixels
   * @param scale multiplied by the sprite width and height
   * @param depth is depth buffer space (-1 to 1) 1 is far -1 is near
   */
  setSpritePosition(
    x: number,
    y: number,
    lowerDepth?: number,
    upperDepth?: number,
    commitToBuffer?: boolean
  ) {
    this.sprite.setPosition(x, y, lowerDepth, upperDepth);
    if (commitToBuffer) {
      this.commitToBuffer();
    }
  }

  scale(scale: number) {
    this.sprite.setSpriteScale(scale);
  }

  flip(flipDirection: SpriteFlip): void {
    this.sprite.setSpriteFlip(flipDirection);
  }
  rotate(angle: number): void {
    this.sprite.setSpriteRotate(angle);
  }

  setFlip(flip: SpriteFlip, commitToBuffer?: boolean) {
    this.sprite.setSpriteFlip(flip);
    if (commitToBuffer) {
      this.commitToBuffer();
    }
  }
  /**
   * Select a sprite
   * @param id the id in the sprite sheet
   */
  setSprite(id?: string | number, commitToBuffer?: boolean) {
    // find the sprite of a given id

    // if id is an number clamp the rang
    if (typeof id === 'number') {
      if (id >= this._spriteData.length) {
        id = this._spriteData.length - 1;
      } else if (id < 0) {
        id = 0;
      }
    }
    let found: boolean = false;

    for (let i = 0; i < this._spriteData.length; i++) {
      const sprite = this._spriteData[i];

      // does the id match or if the id is null just pick the first one or if id is a
      // number does the index match
      if (!id || sprite.id === id || i === id) {
        this._selectedSpriteIndex = i;
        this._selectedSpriteId = sprite.id;

        const xOffset = sprite.offset ? sprite.offset[0] : 0;
        const yOffset = sprite.offset ? sprite.offset[1] : 0;

        this.sprite.setSpritePositionOffset(xOffset, yOffset);

        this.sprite.setSprite({
          pixelXOffset: sprite.loc[0],
          pixelYOffset: sprite.loc[1],
          spriteWidth: sprite.loc[2],
          spriteHeight: sprite.loc[3],
        });
        if (commitToBuffer) {
          this.commitToBuffer();
        }
        found = true;
        break;
      }
    }

    if (!found) {
      console.error('cannot find sprite ' + id);
    }
  }

  /**
   * Commit the geometry to a gl buffer
   */
  abstract commitToBuffer(): void;

  /**
   * Calculates a projection
   * @returns
   */
  calculateProjection() {
    return mat4.orthographic(0, this.eng.width, 0, this.eng.height, 1, -1);
  }

  /**
   * Draw the sprite
   * @param dt
   */
  update(dt: number) {
    if (!this._buffer.buffersCreated) {
      console.error('buffers are not created. Call commitToBuffers() first.');
    } else {
      this._buffer.enable();
      this.eng.spritePerspectiveShader.setSpriteSheet(this._spriteTexture);
      this.eng.spritePerspectiveShader.enable();

      this.eng.spritePerspectiveShader.setProj(this.calculateProjection());

      this.render();
    }
  }

  /**
   * render by calling gl draw functions
   */
  abstract render(): void;
}
