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
   * The tiles that make up the scene
   */
  tiles: { [id: string]: ITileTypeData };

  /**
   * Map is an array of locations that map to a tile
   */
  map: { [loc: string]: string };
}
