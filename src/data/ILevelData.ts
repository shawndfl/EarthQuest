import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';

export enum CollisionSide {
  All = '*',
  N = 'N',
  E = 'E',
  S = 'S',
  W = 'W',
}

export interface TileData {
  /** readable name */
  id: string;
  /** player, enemy, solid, open, door */
  type: string;
  /**Do we need a controller for this */
  dynamic: boolean;

  sourceTextureIndex?: number; // defaults to the first one
  /** the pixel x,y,w,h location in the source texture for this image */
  sourceLocation: '';
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
  alpha?: number; // default 1.0
  options?: string[]; // if it's a door have some options for what level data this connects to

  /** The images mapped to a location (x,y,w,h) in the texture */
  images: { [name: string]: string };
}

/**
 * Used for runtime once the tile data is loaded
 */
export interface RuntimeTileData extends TileData {
  location: vec2;
  texture: Texture;
  /** the quad to manage */
  quad: Quad;
  buffer: GlBuffer;
}

/**
 * This interface is used to build levels.
 */
export interface ILevelData {
  name: string;
  /**
   * The scene component that uses this data.
   */
  controllerType: string;

  /**
   * url for textures these will be loaded into memory and index
   */
  textures: string[];

  tiles: { [id: string]: TileData };
  layers: { [loc: string]: string }[];

  /** map of multi layer 2d tile ids */
  map: string[][];
}

export function cloneLevel(src: ILevelData): ILevelData {
  const result = JSON.parse(JSON.stringify(src));
  return result;
}
