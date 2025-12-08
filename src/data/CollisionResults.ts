import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { CollisionTile } from '../tiles/CollisionTile';
import { TileController } from '../tiles/TileController';

export class CollisionResults {
  source: CollisionTile;
  /** The rect used that got these results */
  rect: rect;
  /** The point used to get these results */
  point: vec2;

  intersectingTiles: CollisionTile[] = [];

  hasCollision(): boolean {
    return this.intersectingTiles.length > 0;
  }
  pushCollision(tile: CollisionTile): void {
    this.intersectingTiles.push(tile);
  }
}
