import { IQuadModel } from './GlBuffer';
import { ITileData } from './ITileData';
import { Texture } from './Texture';

/**
 * This is a utility class that is used to create a IQuadModel that
 * is used to create a GLBuffer.
 */
export class Sprite {
  /** the width, height of a texture */
  private textureSize: [number, number];

  /** The tile offset (x, y) in pixels*/
  private tileOffset: [number, number];

  /** The tile size (width, height) in pixels */
  private tileSize: [number, number];

  /** The position in screen space where the tile will go. (-1 to 1)  */
  private position: [number, number];

  /** The scale value in screen space where the tile will go. (-1 to 1)  */
  private scale: number;

  /** Screen size (width, height) */
  private screenSize: [number, number];

  /** The texture of all the sprites */
  private spriteSheet: Texture;

  /** this is used by the buffer */
  private _quad: IQuadModel;

  get quad() {
    return this._quad;
  }

  constructor() {
    this._quad = {
      min: [-1, -1],
      max: [1, 1],
      minTex: [0, 0],
      maxTex: [1, 1],
    };
  }

  /**
   * Setup the sprite with a sprite sheet and screen size. All calculations are done in
   * pixels.
   * @param spriteSheet
   * @param screenWidth
   * @param screenHeight
   */
  initialize(spriteSheet: Texture, screenWidth: number, screenHeight: number) {
    this.spriteSheet = spriteSheet;
    this.screenSize = [screenWidth, screenHeight];
  }

  /**
   *
   * @param positionX Position in pixels
   * @param positionY Position in pixels
   * @param scale scale of the sprite default is 1.0
   */
  setPosition(positionX: number, positionY: number, scale: number = 1.0) {}

  /**
   * Builds a IQuadModel from ITileData. This makes it easier to build sprites
   * @param options
   * @returns
   */
  getQuadModel(): IQuadModel {
    const minX = this.position[0] * 2 - 1;
    const minY = this.position[1] * 2 - 1;

    const tileWidth = (this.tileSize[0] / this.screenSize[0]) * this.scale;
    const tileHeight = (this.tileSize[1] / this.screenSize[1]) * this.scale;

    const maxX = minX + tileWidth;
    const maxY = minY + tileHeight;

    const minU = this.tileOffset[0] / this.textureSize[0];
    const minV = 1.0 - this.tileOffset[1] / this.textureSize[1];

    const maxU = minU + this.tileSize[0] / this.textureSize[0];
    const maxV = minV - this.tileSize[1] / this.textureSize[1];

    // min v is bottom, max v is top
    return {
      min: [minX, minY],
      max: [maxX, maxY],
      minTex: [minU, minV],
      maxTex: [maxU, maxV],
    };
  }
}
