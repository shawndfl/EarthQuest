import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';

/**
 * Which corners can you collide with?
 *
 */
export interface TileData {
  /** readable name */
  id: string;
  /** player, enemy, solid, open, door */
  type: string;
  /**Do we need a controller for this */
  dynamic: boolean;

  sourceTextureIndex?: number; // defaults to the first one
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

  /**
   * map of multi layer 2d tile ids
   * the layout is layers, then rows, then an array of strings that make up the columns
   */
  map: string[][];
}

export function cloneLevel(src: ILevelData): ILevelData {
  const result = JSON.parse(JSON.stringify(src));
  return result;
}
