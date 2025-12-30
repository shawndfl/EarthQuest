/**
 * The origin of the tile.
 */
export enum TileOrigin {
  Center = 'Center',
  BottomLeft = 'BottomLeft',
}

/**
 * Tile Data
 */
export interface ITileData {
  /** player, enemy, solid, open, door */
  type: string;

  /** the pixel x,y,w,h location in the source texture for this image */
  sourceLocation: string;

  collisionTrigger: {
    triggerName: string;
    collisionPolygon: string[];
  }[];

  /** in pixels x,y,width, height offset for the collision */
  collisionOffset: string;
  /**
   * x, y points that make up a polygon. The points should be in clockwise order.
   * Each string is a x,y component
   */
  collisionPolygon: string[];
  /** default is bottom left */
  origin?: TileOrigin;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
  tileWidth?: number; // default is 8
  tileHeight?: number; // default is 8
  alpha?: number; // default 1.0
  hueRotation?: number;
  options?: string[]; // if it's a door have some options for what level data this connects to

  /** The images mapped to a location (x,y,w,h) in the texture */
  readonly images: { readonly [name: string]: string };
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

  tiles: { [id: string]: ITileData };
}

/**
 * Collection of atlases
 */
export interface ITileAtlasCollection {
  [name: string]: ITileAtlas;
}
