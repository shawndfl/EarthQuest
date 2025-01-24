import vec3 from '../math/vec3';

export interface TileContext {
  direction: vec3; /// The direction the tile is coming from
  i: number; // new position of the tile <float>
  j: number; // new position of the tile <float>
  k: number; // new position of the tile <float>
}
