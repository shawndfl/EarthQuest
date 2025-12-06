import { CollisionResults } from '../data/CollisionResults';
import { CollisionShape } from '../data/ITileAtlas';
import rect from '../math/rect';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { TileController } from './TileController';

export abstract class CollisionTile extends TileController {
  /**
   * The collision rect of the tile.
   */
  protected _collision: rect = new rect();

  get collision(): Readonly<rect> {
    return this._collision;
  }

  async initialize(): Promise<void> {
    await super.initialize();
    this.updateCollision();
  }

  pushOut(source: CollisionTile, speed: number = 0.01): void {
    let distToLeft = source._collision.right - this._collision.left;
    let distToRight = this._collision.right - source._collision.left;
    let distToTop = this._collision.top - source._collision.bottom;
    let distToBottom = source._collision.top - this._collision.bottom;

    distToLeft = distToLeft < 0 ? 0 : distToLeft;
    distToRight = distToRight < 0 ? 0 : distToRight;
    distToTop = distToTop < 0 ? 0 : distToTop;
    distToBottom = distToBottom < 0 ? 0 : distToBottom;

    let deltaX = distToLeft < distToRight ? -distToLeft : distToRight;
    let deltaY = distToTop < distToBottom ? distToTop : -distToBottom;

    if (Math.abs(deltaX) < Math.abs(deltaY)) {
      deltaY = 0;
    } else {
      deltaX = 0;
    }
    const dir = new vec3(deltaX, deltaY, 0);
    const newPos = dir.scale(0.5);
    console.debug('pushing out ' + source.type + ' ' + newPos.x.toFixed(5) + ', ' + newPos.y.toFixed(5));
    source.setTileTransform({ position: newPos });
  }

  /**
   * Draw the collision shape
   */
  drawCollision(color?: vec4): void {
    if (!color) {
      this.eng.debugHelpers.removeRect(this.uuid);
      return;
    }

    if (this.tileData.collisionShape == CollisionShape.Full) {
      this.eng.debugHelpers.setRect(this.uuid, this._collision, color);
    }
  }

  /**
   * Each controller can handle how to respond to the collision.
   * Default is push it out.
   * @param source
   */
  onCollision(source: CollisionTile): void {
    // by default just push out the source tile
    this.pushOut(source);
  }

  /**
   * gets the latest bottom left and creates a collision box around the tileSize
   */
  protected updateCollision(): void {
    this.quad.transform.getTranslation(this.bottomLeft);
    this._collision.left = this.bottomLeft.x + this.tileData.collisionOffset.x;
    this._collision.width = (this.tileData.tileSize.x + this.tileData.collisionOffset.z) * this.eng.pixelScale;
    this._collision.height = (this.tileData.tileSize.y + this.tileData.collisionOffset.w) * this.eng.pixelScale;
    this._collision.top = this.bottomLeft.y + this._collision.height + this.tileData.collisionOffset.y;
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
