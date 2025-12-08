import { Component } from '../core/Component';
import { CollisionResults } from '../data/CollisionResults';
import { CollisionTypes } from '../data/CollisionTypes';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { CollisionTile } from '../tiles/CollisionTile';
import { TileController } from '../tiles/TileController';

export class CollisionManager extends Component {
  private _collisionTiles: Map<string, CollisionTile> = new Map();

  closeLevel(): void {
    this._collisionTiles.clear();
  }

  async loadLevel(): Promise<void> {
    this._collisionTiles.clear();
  }

  /**
   * Register a tile controller
   * @param tileController
   */
  registerTileForCollision(tile: CollisionTile): void {
    this._collisionTiles.set(tile.uuid, tile);
  }

  /**
   * Remove the controller from update
   * @param uuid
   */
  removeTileFromCollision(uuid: string): void {
    this._collisionTiles.delete(uuid);
  }

  /**
   * Check for a collision between this and other tiles.
   * @param source
   * @param filterMask
   * @param collision
   * @returns
   */
  checkCollisionPoint(source: CollisionTile, point: vec2): CollisionResults {
    const results = new CollisionResults();
    results.source = source;
    results.point = point;
    for (let [, other] of this._collisionTiles) {
      // don't collide with yourself
      if (other.uuid == source.uuid) {
        continue;
      }

      // collect the colliding tiles
      if (other.bounds.containsPoint(point)) {
        results.pushCollision(other);
      }
    }
    return results;
  }

  /**
   * checks the collision of the source with all other collision tiles
   * @param source
   * @param rect
   * @returns - a list of all the collision tiles that this source collides with
   */
  checkCollisionRect(source: CollisionTile, rect: rect): CollisionResults {
    const results = new CollisionResults();
    results.rect = rect;
    results.source = source;
    for (let [, other] of this._collisionTiles) {
      // don't collide with yourself
      if (other.uuid == source.uuid) {
        continue;
      }

      if (other.bounds.intersects(rect)) {
        results.pushCollision(other);
      }
    }
    return results;
  }
}
