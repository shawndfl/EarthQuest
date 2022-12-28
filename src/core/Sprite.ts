import { IQuadModel } from './GlBuffer';
import { Texture } from './Texture';

export enum SpriteFlip {
  None,
  XFlip,
  YFlip,
  Both,
}

/**
 * This is a utility class that is used to create a IQuadModel that
 * is used to create a GLBuffer.
 */
export class Sprite {
  /** The size (width, height) in pixels of the sprite within the sprite sheet */
  private _spriteSize: [number, number];

  /** The width and height of the texture */
  private _spriteSheetSize: [number, number];

  /** The position in screen space where the tile will go. (-1 to 1)  */
  private _position: [number, number];

  /** The scale value in screen space where the tile will go. (-1 to 1)  */
  private _scale: number;

  /** Screen size (width, height) */
  private _screenSize: [number, number];

  /** The texture of all the sprites */
  private _spriteSheet: Texture;

  /** this is used by the buffer */
  private _quad: IQuadModel;

  /**
   * Get the position in pixels.
   */
  get position(): { x: number; y: number } {
    const x = (this._position[0] * 2.0 - 1.0) * this._screenSize[0];
    const y = (this._position[1] * 2.0 - 1.0) * this._screenSize[1];
    return { x: x, y: y };
  }

  get spriteSize(): { width: number; height: number } {
    return;
  }

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
    this._spriteSheet = spriteSheet;
    this._spriteSheetSize = [this._spriteSheet.width, this._spriteSheet.height];
    this._screenSize = [screenWidth, screenHeight];
  }

  /**
   * This function is used to select a sprite from the sprite sheet
   */
  setSprite(opt: {
    pixelXOffset: number;
    pixelYOffset: number;
    spriteWidth: number;
    spriteHeight: number;
    spriteFlip?: SpriteFlip;
  }) {
    const sheetW = this._spriteSheetSize[0];
    const sheetH = this._spriteSheetSize[1];
    const minX = opt.pixelXOffset / sheetW;
    const minY = 1.0 - opt.pixelYOffset / sheetH;
    const maxX = (opt.pixelXOffset + opt.spriteWidth) / sheetW;
    const maxY = 1.0 - (opt.pixelYOffset + opt.spriteHeight) / sheetH;

    if (opt.spriteFlip == SpriteFlip.XFlip) {
      this._quad.minTex = [maxX, minY];
      this._quad.maxTex = [minX, maxY];
    } else if (opt.spriteFlip == SpriteFlip.YFlip) {
      this._quad.minTex = [minX, maxY];
      this._quad.maxTex = [maxX, minY];
    } else if (opt.spriteFlip == SpriteFlip.Both) {
      this._quad.minTex = [maxX, maxY];
      this._quad.maxTex = [minX, minY];
    } else {
      this._quad.minTex = [minX, minY];
      this._quad.maxTex = [maxX, maxY];
    }
    this._spriteSize = [opt.spriteWidth, opt.spriteHeight];
  }
  /**
   *
   * @param positionX Position in pixels
   * @param positionY Position in pixels
   * @param scale scale of the sprite default is 1.0
   */
  setPosition(opt: { x: number; y: number; scale?: number }) {
    if (!this._spriteSize) {
      throw '_tileSize not set call setSprite() first';
    }
    if (!opt.scale) {
      opt.scale = 1.0;
    }
    this._scale = opt.scale;

    // convert to screen space, min is the top left corner
    this._quad.min = [
      (opt.x / this._screenSize[0]) * 2.0 - 1,
      (opt.y / this._screenSize[1]) * 2.0 - 1,
    ];

    const tileWidth = (this._spriteSize[0] / this._screenSize[0]) * this._scale;
    const tileHeight =
      (this._spriteSize[1] / this._screenSize[1]) * this._scale;

    // max is the bottom right
    this._quad.max = [
      this._quad.min[0] + tileWidth,
      this._quad.min[1] + tileHeight,
    ];
  }

  /**
   * Builds a IQuadModel from ITileData. This makes it easier to build sprites
   * @param opt
   * @returns
   */
  /*
  getQuadModel(): IQuadModel {
    const minX = this._position[0] * 2 - 1;
    const minY = this._position[1] * 2 - 1;

    const tileWidth = (this._tileSize[0] / this._screenSize[0]) * this._scale;
    const tileHeight = (this._tileSize[1] / this._screenSize[1]) * this._scale;

    const maxX = minX + tileWidth;
    const maxY = minY + tileHeight;

    const minU = this._tileOffset[0] / this.textureSize[0];
    const minV = 1.0 - this._tileOffset[1] / this.textureSize[1];

    const maxU = minU + this._tileSize[0] / this.textureSize[0];
    const maxV = minV - this._tileSize[1] / this.textureSize[1];

    // min v is bottom, max v is top
    return {
      min: [minX, minY],
      max: [maxX, maxY],
      minTex: [minU, minV],
      maxTex: [maxU, maxV],
    };
  }
  */
}
