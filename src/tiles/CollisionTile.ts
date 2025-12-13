import { CollisionResults } from '../data/CollisionResults';
import rect from '../math/rect';
import vec4 from '../math/vec4';
import { TileController } from './TileController';

export abstract class CollisionTile extends TileController {
  /**
   * The collision rect of the tile.
   */
  protected _bounds: rect = new rect();

  get bounds(): Readonly<rect> {
    return this._bounds;
  }

  async initialize(): Promise<void> {
    await super.initialize();
    this.updateCollision();
  }

  /**
   * Draw the collision shape
   */
  drawCollision(color?: vec4): void {
    if (!color) {
      this.eng.debugHelpers.removeRect(this.uuid);
      return;
    }

    this.eng.debugHelpers.setRect(this.uuid, this._bounds, color);
  }

  /**
   * Each controller can handle how to respond to the collision.
   * Default is push it out.
   * @param source
   */
  onCollision(source: CollisionTile): void {}

  /**
   * gets the latest bottom left and creates a collision box around the tileSize
   */
  protected updateCollision(): void {
    this.quad.transform.getTranslation(this.bottomLeft);
    this._bounds.left = this.bottomLeft.x + this.tileData.collisionOffset.x;
    this._bounds.width = (this.tileData.tileSize.x + this.tileData.collisionOffset.z) * this.eng.pixelScale;
    this._bounds.height = (this.tileData.tileSize.y + this.tileData.collisionOffset.w) * this.eng.pixelScale;
    this._bounds.top = this.bottomLeft.y + this._bounds.height + this.tileData.collisionOffset.y;
  }

  /**
   * Alow others to respond to this collision
   * @param results
   */
  collisionResponse(results: CollisionResults): void {
    for (let tileController of results.intersectingTiles) {
      tileController.onCollision(results.source);
    }
  }

  update(dt: number): void {
    //if (results.hasCollision()) {
    //this.drawCollision(new vec4([1, 0, 0, 1]));
    //results.intersectingTiles.forEach((t) => t.drawCollision(new vec4([0, 0, 1, 1])));
    //} else {
    //  this.drawCollision(null);
    // }
  }
}
