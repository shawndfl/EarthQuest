/**
 * This interface is used to describe a tile quad
 */
export interface ITileData {
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
