import { CollisionResults } from '../data/CollisionResults';
import rect from '../math/rect';
import vec4 from '../math/vec4';
import { TileController } from './TileController';

export class CollisionTile extends TileController {
  /**
   * The collision rect of the tile.
   */
  protected _bounds: rect = new rect();

  get bounds(): Readonly<rect> {
    return this._bounds;
  }

  /**
   * initialize type
   */
  async initialize(): Promise<void> {
    this.updateCollision();
  }

  setBounds(rect: rect): void {
    this._bounds = rect;
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
    this._bounds.left = this.bottomLeft.x + this.collisionOffset.x;
    this._bounds.width = (this.tileSize.x + this.collisionOffset.z) * this.eng.pixelScale;
    this._bounds.height = (this.tileSize.y + this.collisionOffset.w) * this.eng.pixelScale;
    this._bounds.top = this.bottomLeft.y + this._bounds.height + this.collisionOffset.y;
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

  update(dt: number): void {}
}
