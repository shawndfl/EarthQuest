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
  /** The width and height in pixels of the sprite within the sprite sheet */
  private _spriteLoc: { x: number; y: number; width: number; height: number };

  /** The width and height of the texture in pixels*/
  private _spriteSheetSize: { width: number; height: number };

  /** The position in pixels of the canvas where the sprite will go. */
  private _position: { x: number; y: number };

  /** is the sprite flipped some way */
  private _spriteFlip: SpriteFlip;

  /** sprite rotation in degrees */
  private _spriteRotate: number;

  /** The scale image and keep the aspect ratio  */
  private _scale: number;

  /** Screen size */
  private _screenSize: { width: number; height: number };

  /** The texture of all the sprites */
  private _spriteSheet: Texture;

  /** this is used by the buffer */
  private _quad: IQuadModel;

  /**
   * Get the position in pixels.
   */
  get position(): { x: number; y: number } {
    return this._position;
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
    this._spriteSheetSize = {
      width: 0,
      height: 0,
    };
    this._screenSize = { width: 0, height: 0 };
    this._position = { x: 0, y: 0 };
    this._spriteLoc = { x: 0, y: 0, width: 0, height: 0 };
    this._spriteFlip = SpriteFlip.None;
    this._spriteRotate = 0;
  }

  /**
   * Setup the sprite with a sprite sheet and screen size. All calculations are done in
   * pixels.
   * @param spriteSheet
   * @param screenWidth
   * @param screenHeight
   */
  initialize(spriteSheet: Texture, screenWidth: number, screenHeight: number) {
    this._quad = {
      min: [-1, -1],
      max: [1, 1],
      minTex: [0, 0],
      maxTex: [1, 1],
    };
    this._position = { x: 0, y: 0 };
    this._spriteLoc = { x: 0, y: 0, width: 0, height: 0 };

    this._spriteSheet = spriteSheet;
    this._spriteSheetSize = {
      width: this._spriteSheet.width,
      height: this._spriteSheet.height,
    };
    this._screenSize = { width: screenWidth, height: screenHeight };
    this._spriteFlip = SpriteFlip.None;
    this._spriteRotate = 0;
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
    this._spriteLoc.x = opt.pixelXOffset;
    this._spriteLoc.y = opt.pixelYOffset;
    this._spriteLoc.width = opt.spriteWidth;
    this._spriteLoc.height = opt.spriteHeight;
    this._spriteFlip = opt.spriteFlip ?? SpriteFlip.None;

    this.updateBuffer();
  }
  /**
   *
   * @param positionX Position in pixels
   * @param positionY Position in pixels
   * @param scale scale of the sprite default is 1.0
   */
  setPosition(opt: { x: number; y: number; scale?: number }) {
    if (!opt.scale) {
      this._scale = 1.0;
    } else {
      this._scale = opt.scale;
    }
    this._position.x = opt.x;
    this._position.y = opt.y;

    this.updateBuffer();
  }

  updateBuffer() {
    const sheetW = this._spriteSheetSize.width;
    const sheetH = this._spriteSheetSize.height;
    const minX = this._spriteLoc.x / sheetW;
    const minY = 1.0 - this._spriteLoc.y / sheetH;
    const maxX = (this._spriteLoc.x + this._spriteLoc.width) / sheetW;
    const maxY = 1.0 - (this._spriteLoc.y + this._spriteLoc.height) / sheetH;

    if (this._spriteFlip == SpriteFlip.XFlip) {
      this._quad.minTex = [maxX, minY];
      this._quad.maxTex = [minX, maxY];
    } else if (this._spriteFlip == SpriteFlip.YFlip) {
      this._quad.minTex = [minX, maxY];
      this._quad.maxTex = [maxX, minY];
    } else if (this._spriteFlip == SpriteFlip.Both) {
      this._quad.minTex = [maxX, maxY];
      this._quad.maxTex = [minX, minY];
    } else {
      this._quad.minTex = [minX, minY];
      this._quad.maxTex = [maxX, maxY];
    }

    // convert to screen space, min is the top left corner
    this._quad.min = [
      (this._position.x / this._screenSize.width) * 2.0 - 1,
      (this._position.y / this._screenSize.height) * 2.0 - 1,
    ];

    const spriteWidth =
      (this._spriteLoc.width / this._screenSize.width) * this._scale;
    const spriteHeight =
      (this._spriteLoc.height / this._screenSize.height) * this._scale;

    // max is the bottom right
    this._quad.max = [
      this._quad.min[0] + spriteWidth,
      this._quad.min[1] + spriteHeight,
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
