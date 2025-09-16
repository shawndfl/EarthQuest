import rect from '../math/rect';
import { CollisionTile } from '../tiles/CollisionTile';
import { TileController } from '../tiles/TileController';

export class CollisionResults {
  source: CollisionTile;
  intersectingTiles: CollisionTile[] = [];

  hasCollision(): boolean {
    return this.intersectingTiles.length > 0;
  }
  pushCollision(tile: CollisionTile): void {
    this.intersectingTiles.push(tile);
  }
}
