import rect from '../math/rect';
import { TileController } from '../tiles/TileController';

export class CollisionResults {
  source: TileController;
  intersectingTiles: TileController[] = [];

  hasCollision(): boolean {
    return this.intersectingTiles.length > 0;
  }
  pushCollision(tile: TileController): void {
    this.intersectingTiles.push(tile);
  }
}
