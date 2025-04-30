import { IQuadModel } from '../graphics/GlBuffer';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import { ITileTypeData } from '../systems/ITileTypeData';
import { ILevelData } from './ILevelData';
import { SceneControllerType } from './SceneControllerType';

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

  /**
   * This quad maps to the quad in the spriteMesh
   */
  quad: IQuadModel;

  /**
   * Other quads that are controlled by this sprite data.
   * This happens when the scene file uses a range for placing tiles
   */
  otherQuads: IQuadModel[];
}

/**
 * This interface is used to build levels.
 */
export interface ILevelData2 {
  name: string;
  /**
   * The scene component that uses this data.
   */
  controllerType: SceneControllerType;

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

export function cloneLevel(src: ILevelData2): ILevelData2 {
  const result = JSON.parse(JSON.stringify(src));
  return result;
}
