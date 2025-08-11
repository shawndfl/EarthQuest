import { ITileAtlas } from './ITileAtlas';

/**
 * This interface is used to build levels.
 */
export interface ILevelData {
  name: string;
  /**
   * The scene component that uses this data.
   */
  controllerType: string;

  atlas: ITileAtlas;

  /**
   * map of multi layer 2d tile ids
   * the layout is layers, then rows, then an array of strings that make up the columns
   */
  map: string[][];
}

export function cloneLevel(src: ILevelData): ILevelData {
  const result = JSON.parse(JSON.stringify(src));
  return result;
}
