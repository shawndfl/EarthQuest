import { IQuadModel } from '../core/GlBuffer';
import { Texture } from '../core/Texture';

/**
 * This interface is used to describe a tile quad
 */
interface ITileData {
  /** the size of the square texture */
  textureSize: number;

  /** The the index of the tile you are interested in. 0 is the top left 'n' is the bottom right  */
  tileIndex: number;

  /** The size of the square tile of the tiles in pixels */
  tileSize: number;

  /** The position in screen space where the tile will go. (-1 to 1)  */
  position: [number, number];

  /** The size in screen space where the tile will go. (-1 to 1)  */
  size: [number, number];
}

/**
 * This is a utility class that is used to create a IQuadModel that
 * is used to create a GLBuffer.
 */
export class TileBuilder {
  static buildQuad(options: ITileData): IQuadModel {
    const minX = options.position[0];
    const minY = options.position[1];

    const maxX = options.position[0] + options.size[0];
    const maxY = options.position[1] + options.size[1];

    const rows = options.tileSize / options.textureSize;
    const textureSize = 1.0 / rows;
    const minU = options.tileIndex % rows;
    const minV = options.tileIndex / rows;

    const maxU = minU - textureSize;
    const maxV = minV - textureSize;

    return {
      min: [minX, minY],
      max: [maxX, maxY],
      minTex: [minU, minV],
      maxTex: [maxU, maxV],
    };
  }
}
