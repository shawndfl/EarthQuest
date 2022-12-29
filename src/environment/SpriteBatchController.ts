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
export class SpritBatchController
  extends Component
  implements ISpriteController
{
  private _spriteData: ISpriteData[];
  private _sprites: Map<string, Sprite>;
  private _spriteTexture: Texture;
  private _buffer: GlBuffer;
  private _selectedSpriteIndex: number;
  private _selectedSpriteId: string;
  private _activeSprite: string;

  get sprite(): Sprite {
    return this._sprites.get(this._activeSprite);
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
    this._sprites = new Map<string, Sprite>();
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
   * A way of keeping track of our sprites
   * @param id
   * @returns
   */
  private getSprite(id: string): Sprite {
    let sprite = this._sprites.get(id);
    if (!this._sprites.has(id)) {
      // create new sprite and initialize it
      sprite = new Sprite(id);
      sprite.initialize(
        {
          width: this._spriteTexture.width,
          height: this._spriteTexture.height,
        },
        this.gl.canvas.width,
        this.gl.canvas.height
      );
      this._sprites.set(id, sprite);
    }
    return sprite;
  }

  activeSprite(spriteId: string) {
    this._activeSprite = spriteId;
  }

  flip(flipDirection: SpriteFlip): void {
    if (!this._activeSprite) {
      throw new Error('activeSprite not set call activeSprite()');
    }

    const spriteModel = this.getSprite(this._activeSprite);
    spriteModel.setSpriteFlip(flipDirection);
  }
  rotate(angle: number): void {
    if (!this._activeSprite) {
      throw new Error('activeSprite not set call activeSprite()');
    }

    const spriteModel = this.getSprite(this._activeSprite);
    spriteModel.setSpriteRotate(angle);
  }
  scale(scale: number): void {
    if (!this._activeSprite) {
      throw new Error('activeSprite not set call activeSprite()');
    }

    const spriteModel = this.getSprite(this._activeSprite);
    spriteModel.setSpriteScale(scale);
  }

  /**
   * Sets the sprites position.
   * NOTE: You must call commitBuffer() for the changes to take affect.
   *
   * @param x in screen pixels
   * @param y in screen pixels
   * @param depth is depth buffer space (-1 to 1) 1 is far -1 is near
   */
  setSpritePosition(x: number, y: number, depth?: number) {
    if (!this._activeSprite) {
      throw new Error('activeSprite not set call activeSprite()');
    }
    const spriteModel = this.getSprite(this._activeSprite);
    spriteModel.setPosition(x, y, depth ?? 0);
  }

  /**
   * Select a sprite from the sprite sheet
   *
   * NOTE: You must call commitBuffer() for the changes to take affect.
   */
  setSprite(id?: string | number) {
    if (!this._activeSprite) {
      throw new Error('activeSprite not set call activeSprite()');
    }

    // find the sprite of a given id
    const spriteModel = this.getSprite(this._activeSprite);

    // if id is an number clamp the rang
    if (typeof id === 'number') {
      if (id >= this._spriteData.length) {
        id = this._spriteData.length - 1;
      } else if (id < 0) {
        id = 0;
      }
    }

    for (let i = 0; i < this._spriteData.length; i++) {
      const sprite = this._spriteData[i];

      // does the id match or if the id is null just pick the first one or if id is a
      // number does the index match
      if (!id || sprite.id === id || i === id) {
        this._selectedSpriteIndex = i;
        this._selectedSpriteId = sprite.id;

        spriteModel.setSprite({
          pixelXOffset: sprite.loc[0],
          pixelYOffset: sprite.loc[1],
          spriteWidth: sprite.loc[2],
          spriteHeight: sprite.loc[3],
        });
        break;
      }
    }
  }

  commitToBuffer() {
    const quads: IQuadModel[] = [];
    this._sprites.forEach((sprite) => {
      quads.push(sprite.quad);
    });

    // update the buffer
    this._buffer.setBuffers(quads, false);
  }

  /**
   * Draw the sprite
   * @param dt
   */
  update(dt: number) {
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
