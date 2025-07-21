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
  sourceTextureId?: string; // defaults to the first one
  /** the pixel x,y, w,h location in the source texture for this image */
  sourceLocation: '';
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
  options?: string[]; // if it's a door have some options for what level data this connects to

  /** The images mapped to a location (x,y,w,h) in the texture */
  images: { [name: string]: string };

  texture: Texture;

  width: number;
  height: number;
  position: vec2;
  scale: vec2;
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
   * url for textures
   */
  textures: { [id: string]: string };

  tiles: { [id: string]: TileData };
  layer1: { [loc: string]: string };
}

export function cloneLevel(src: ILevelData): ILevelData {
  const result = JSON.parse(JSON.stringify(src));
  return result;
}
