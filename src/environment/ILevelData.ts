import { LevelConstructionParams } from './LevelConstructionParams';

export interface SourceTileSheet {
  name: string;
  path: string;
  tileWidth: number;
  tileHeight: number;
  sheetWidth: number;
  sheetHeight: number;
}

/**
 * These are cell properties that are used by the Ground class
 * to make interesting levels.
 */
export interface ITileData {
  /**
   * Type of the cell this is used to the engine to create a behavior
   */
  type: string;

  /**
   * How a player can access the tiles
   */
  access?: { tr: boolean; tl: boolean; br: boolean; bl: boolean };
}

/**
 * This interface is used to build levels.
 */
export interface ILevelData {
  /**  */
  tiles: ITileData[];

  /** the index returned by the cells is offset by 10 to make it easier to align number in the json */
  cells: number[][][];
}
