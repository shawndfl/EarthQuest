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
   * index into the tile image
   */
  imageIndex: number;

  /**
   * Index of the tile in the tile sheet
   */
  tileSheetIndex: number;

  /** How a player can access the tiles */
  access: { tr: boolean; tl: boolean; br: boolean; bl: boolean };

  /** is the tile flipped horizontality  */
  flipped: boolean;

  /** rotate the image 0, 90, 180, 270 degrees */
  rotate: 0 | 90 | 180 | 270;
}

/**
 * This interface is used to build levels.
 */
export interface ILevelData {
  /** The path to the tile sheet */
  tileSheets: SourceTileSheet[];

  /**  */
  tiles: ITileData[];

  /** the index returned by the cells is offset by 10 to make it easier to align number in the json */
  cells: number[][][];
}
