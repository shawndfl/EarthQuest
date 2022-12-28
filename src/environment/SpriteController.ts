import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import { ISpriteData } from '../core/ISpriteData';
import { Sprite, SpriteFlip } from '../core/Sprite';
import { Texture } from '../core/Texture';
import { SpriteShader } from '../shaders/SpriteShader';
import { ISpriteController } from './ISprintController';

/**
 * This class controls a sprite's position and scale
 * given a sprite sheet and some json data that holds the
 * sprite offset and size in pixels.
 */
export class SpritController extends Component implements ISpriteController {
  private _spriteData: ISpriteData[];
  private _sprite: Sprite;
  private _spriteTexture: Texture;
  private _buffer: GlBuffer;
  private _selectedSpriteIndex: number;
  private _selectedSpriteId: string;

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
    this._sprite = new Sprite();
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

    // set up the sprite
    this._sprite.initialize(
      { width: texture.width, height: texture.height },
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    // create the gl buffers for this sprite
    this._buffer = new GlBuffer(this.gl);

    // set a default sprite
    this.setSprite(defaultSprite);

    // set the position of the sprite on the screen
    this._sprite.setPosition(0, 0, 0);

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
    depth?: number,
    commitToBuffer?: boolean
  ) {
    this._sprite.setPosition(x, y, depth ?? 0);
    if (commitToBuffer) {
      this.commitToBuffer();
    }
  }

  scale(scale: number) {
    this._sprite.setSpriteScale(scale);
  }

  flip(flipDirection: SpriteFlip): void {
    this._sprite.setSpriteFlip(flipDirection);
  }
  rotate(angle: number): void {
    this._sprite.setSpriteRotate(angle);
  }

  setFlip(flip: SpriteFlip, commitToBuffer?: boolean) {
    this._sprite.setSpriteFlip(flip);
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

        this._sprite.setSprite({
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

  commitToBuffer() {
    this._buffer.setBuffers([this._sprite.quad], false);
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
      this.eng.spriteShader.setSpriteSheet(this._spriteTexture);
      this.eng.spriteShader.enable();

      {
        const vertexCount = this._buffer.indexCount;
        const type = this.gl.UNSIGNED_SHORT;
        const offset = 0;
        this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
      }
    }
  }
}
