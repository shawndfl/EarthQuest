import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import { ISpriteSheetData } from '../core/ISpriteSheetData';
import { Sprite } from '../core/Sprite';
import { Texture } from '../core/Texture';
import { SpriteShader } from '../shaders/SpriteShader';

/**
 * Controls a sprite
 */
export class SpritController {
  private _spriteSheet: Texture;
  private _spriteData: ISpriteSheetData;
  private _sprite: Sprite;
  private _shader: SpriteShader;
  private _buffer: GlBuffer;

  constructor(private gl: WebGL2RenderingContext) {}

  initialize(texture: Texture, spriteData: ISpriteSheetData) {
    this._sprite = new Sprite();
    // set up the sprite
    this._sprite.initialize(
      texture,
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    // select a sprite out of the sprite sheet
    this._sprite.setSprite({
      pixelXOffset: 2,
      pixelYOffset: 24,
      spriteWidth: 16,
      spriteHeight: 24,
    });

    // set the position of the sprite on the screen
    this._sprite.setPosition({ x: 100, y: 100, scale: 10 });

    this._buffer = new GlBuffer(this.gl);

    this._buffer.setBuffers([this._sprite.quad], false);

    this._shader = new SpriteShader(this.gl, 'sprite');
    this._shader.setSpriteSheet(texture);
  }

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
