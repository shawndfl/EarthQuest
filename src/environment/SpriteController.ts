import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import { ISpriteData } from '../core/ISpriteData';
import { Sprite } from '../core/Sprite';
import { Texture } from '../core/Texture';
import { SpriteShader } from '../shaders/SpriteShader';

/**
 * This class controls a sprite's position and scale
 * given a sprite sheet and some json data that holds the
 * sprite offset and size in pixels.
 */
export class SpritController {
  private _spriteData: ISpriteData[];
  private _sprite: Sprite;
  private _shader: SpriteShader;
  private _buffer: GlBuffer;

  constructor(private gl: WebGL2RenderingContext) {
    this._sprite = new Sprite();
    this._spriteData = [];
  }

  /**
   * setup the sprite
   * @param texture
   * @param spriteData
   */
  initialize(
    texture: Texture,
    spriteData: ISpriteData[],
    defaultSprite?: string
  ) {
    // save the data
    this._spriteData = spriteData;

    // set up the sprite
    this._sprite.initialize(
      texture,
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    // create the gl buffers for this sprite
    this._buffer = new GlBuffer(this.gl);

    // set a default sprite
    this.setSprite(defaultSprite);

    // set the position of the sprite on the screen
    this._sprite.setPosition({ x: 100, y: 100, scale: 10 });

    // setup the shader for the sprite
    this._shader = new SpriteShader(this.gl, 'sprite');
    this._shader.setSpriteSheet(texture);
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
   */
  setSpritePosition(x: number, y: number, scale: number = 1.0) {
    this._sprite.setPosition({ x: x, y: y, scale: scale });
    // update the buffer
    this._buffer.setBuffers([this._sprite.quad], false);
  }

  /**
   * Select a sprite
   * @param id the id in the sprite sheet
   */
  setSprite(id?: string) {
    // find the sprite of a given id
    for (let i = 0; i < this._spriteData.length; i++) {
      const sprite = this._spriteData[i];

      // does the id match or if the id is null just pick the first one
      if (!id || sprite.id == id) {
        this._sprite.setSprite({
          pixelXOffset: sprite.x,
          pixelYOffset: sprite.y,
          spriteWidth: sprite.w,
          spriteHeight: sprite.h,
        });

        // update the buffer
        this._buffer.setBuffers([this._sprite.quad], false);
        break;
      }
    }
  }

  /**
   * Draw the sprite
   * @param dt
   */
  update(dt: number) {
    this._buffer.enable();
    this._shader.enable();

    {
      const vertexCount = this._buffer.indexCount;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}
