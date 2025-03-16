export interface ITileData {
  /**
   *  the id of the sprite data
   */
  id: string;
  /**
   * the location of the sprite data in the sprite sheet.
   * [cols, rows]
   */
  index?: [number, number];

  /**
   * Flip the image horizontal
   */
  flipX?: boolean;

  /**
   * Flip vertically
   */
  flipY?: boolean;

  /**
   * Offset the the image
   */
  offset?: [number, number];

  /**
   * the location of the sprite data in the sprite sheet. This will
   * override whatever is in the index field. This is in pixels of
   * the sprite sheet [x,y, width, height]
   */
  loc?: [number, number, number, number];
}

/**
 * This interface is used to describe a sprite in a sprite sheet
 */
export interface ISpriteData {
  /**
   * Id for this data
   */
  id: string;
  /**
   * The pixel height of a tile. Mostly 24 or 32
   */
  tileHeight: number;
  /**
   * The pixel width of a tile. Mostly 16 or 32
   */
  tileWidth: number;

  /**
   * Space inbetween tiles
   */
  tileSpacing: number;

  /** Offset in pixels */
  tileOffset: number;

  /**
   * Tile data
   */
  tiles: ITileData[];
}
