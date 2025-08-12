/**
 * Which corners can you collide with?
 *
 */
export interface TileData {
  /** readable name */
  id: string;
  /** player, enemy, solid, open, door */
  type: string;

  /** the pixel x,y,w,h location in the source texture for this image */
  sourceLocation: string;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
  tileXOffset?: number;
  tileYOffset?: number;
  tileWidth?: number; // default is 8
  tileHeight?: number; // default is 8
  alpha?: number; // default 1.0

  /**
   * Set flags for each tile that is the user can collide with.
   * For example, a 16x24 character would be
   *   x,x
   *   x,x
   *   x,x
   */
  collisionTiles: string[][];
  options?: string[]; // if it's a door have some options for what level data this connects to

  /** The images mapped to a location (x,y,w,h) in the texture */
  images: { [name: string]: string };
}

/**
 * This interface is used to build levels.
 */
export interface ITileAtlas {
  name: string;
  /**
   * url for textures these will be loaded into memory and index
   */
  texture: string;

  tiles: { [id: string]: TileData };
}
