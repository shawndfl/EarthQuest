import { Engine } from '../core/Engine';
import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import { ISpriteData } from '../core/ISpriteData';
import { Sprite, SpriteFlip } from '../core/Sprite';
import { Texture } from '../core/Texture';
import mat4 from '../math/mat4';
import { ISpriteController } from './ISprintController';
import { SpritBaseController } from './SpriteBaseController';

/**
 * This class controls a sprite's position and scale
 * given a sprite sheet and some json data that holds the
 * sprite offset and size in pixels.
 */
export class SpritBatchController
  extends SpritBaseController
  implements ISpriteController
{
  private _sprites: Map<string, Sprite>;
  private _activeSprite: string;

  get sprite(): Sprite {
    return this.getSprite(this._activeSprite);
  }
  get selectedSpriteIndex() {
    return this._selectedSpriteIndex;
  }

  get spriteCount(): number {
    return this._spriteData.length;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sprites = new Map<string, Sprite>();
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
    super.initialize(texture, spriteData, defaultSprite);
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

  clearAllSprites() {
    this._sprites.clear();
  }

  activeSprite(spriteId: string) {
    this._activeSprite = spriteId;
  }

  commitToBuffer() {
    const quads: IQuadModel[] = [];
    this._sprites.forEach((sprite) => {
      quads.push(sprite.quad);
    });

    // update the buffer
    this._buffer.setBuffers(quads, false);
  }

  render() {
    const vertexCount = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
