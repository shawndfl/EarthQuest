import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import { Texture } from '../core/Texture';

/**
 * This interface is used to describe a tile quad
 */
interface ITileData {
  /** the width, height of a texture */
  textureSize: [number, number];

  /** The tile offset (x, y) in pixels*/
  tileOffset: [number, number];

  /** The tile size (width, height) in pixels */
  tileSize: [number, number];

  /** The position in screen space where the tile will go. (-1 to 1)  */
  position: [number, number];

  /** The scale value in screen space where the tile will go. (-1 to 1)  */
  scale: number;

  /** Screen size (width, height) */
  screenSize: [number, number];
}

/**
 * This is a utility class that is used to create a IQuadModel that
 * is used to create a GLBuffer.
 */
export class TileBuilder {
  /**
   * Builds a IQuadModel from ITileData. This makes it easier to build sprites
   * @param options
   * @returns
   */
  static buildQuad(options: ITileData): IQuadModel {
    const minX = options.position[0] * 2 - 1;
    const minY = options.position[1] * 2 - 1;

    const tileWidth =
      (options.tileSize[0] / options.screenSize[0]) * options.scale;
    const tileHeight =
      (options.tileSize[1] / options.screenSize[1]) * options.scale;

    const maxX = minX + tileWidth;
    const maxY = minY + tileHeight;

    const minU = options.tileOffset[0] / options.textureSize[0];
    const minV = 1.0 - options.tileOffset[1] / options.textureSize[1];

    const maxU = minU + options.tileSize[0] / options.textureSize[0];
    const maxV = minV - options.tileSize[1] / options.textureSize[1];

    // min v is bottom, max v is top
    return {
      min: [minX, minY],
      max: [maxX, maxY],
      minTex: [minU, minV],
      maxTex: [maxU, maxV],
    };
  }
}
