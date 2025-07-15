import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';

export enum CollisionSide {
  All = '*',
  N = 'N',
  E = 'E',
  S = 'S',
  W = 'W',
}

export interface SpriteData {
  id: string;
  type: string;
  textureId: string;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
  options?: string[];
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

  /**
   * pixel size of a tile is 8 X tileScale
   */
  tileScale: number;

  /**
   * The tiles that make up the scene,
   * The value is a location (x,y,w,h) or id in the sprites
   */
  tiles: { [id: string]: string };

  /**
   * Collision location throughout the world
   */
  collisions: { [id: string]: CollisionSide };

  /**
   * The tiles can reference an id to customize a tile
   */
  sprites: { [id: string]: SpriteData };
}

export function cloneLevel(src: ILevelData): ILevelData {
  const result = JSON.parse(JSON.stringify(src));
  return result;
}
