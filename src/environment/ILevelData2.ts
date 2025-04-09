import { ITileTypeData } from '../systems/ITileTypeData';
import { ILevelData } from './ILevelData';
import { SceneControllerType } from './SceneControllerType';

/**
 * This interface is used to build levels.
 */
export interface ILevelData2 {
  name: string;
  /**
   * The scene component that uses this data.
   */
  controllerType: SceneControllerType;

  /**
   * The url of the sprite sheet.
   */
  spriteSheet: string;
  /**
   * url for the tile sheet
   */
  tileSheet: string;

  /**
   * pixel size of a tile is 8 X tileScale
   */
  tileScale: number;

  /**
   * The tiles that make up the scene
   */
  tiles: { [id: string]: string };

  /**
   * Map is an array of locations that map to a tile
   */
  sprites: { [loc: string]: string };

  spriteMeta: { [loc: string]: string };
  tileMeta: { [loc: string]: string };
}

export function cloneLevel(src: ILevelData2): ILevelData2 {
  const result = JSON.parse(JSON.stringify(src));
  return result;
}
