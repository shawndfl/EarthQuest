import { ITileData } from '../graphics/ISpriteData';
import { ITileTypeData } from '../systems/TileFactory';
import { SceneControllerType } from './SceneControllerType';

/**
 * This interface is used to build levels.
 */
export interface ILevelData {
  /**
   * The scene component that uses this data.
   */
  controllerType: SceneControllerType;

  /**
   * The url of the sprite sheet.
   */
  spriteSheetUrl: string;

  /**
   * url for the sprite data
   */
  spriteDataUrl: string;

  /**
   * These are cell types that are used by the Ground class
   * to make interesting levels. These tiles types will map to a sprite sheet.
   * format:
   *     tileType | sprite sheet tile Id | other parameters
   */
  tiles: string[];

  tiles2: ITileTypeData[];

  /**
   * The index returned by the cells is offset by 10 to make it easier to align number in the json.
   * The array is height, column, row and the value is an index into tiles.
   */
  encode: string[][];
}
