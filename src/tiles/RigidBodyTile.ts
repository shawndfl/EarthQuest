import { CollisionResults } from '../data/CollisionResults';
import rect from '../math/rect';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { CollisionTile } from './CollisionTile';

export abstract class RigidBodyTile extends CollisionTile {
  private _position: vec3 = new vec3();
  velocity: vec3 = new vec3();

  private lastCollisionResults: CollisionResults;

  get position(): vec3 {
    return this._position;
  }

  setPosition(position: vec3): void {
    this._position.x = position.x;
    this._position.y = position.y;
    this._position.z = position.z;
    super.setPosition(position);
    this.eng.viewManager.setTarget(this.bottomLeft.x - this.eng.width / 2, this.bottomLeft.y - this.eng.height / 2);
  }

  /**
   * Moves the rigid body by updating the position and adjusting for collision detection
   */
  protected moveAndSlide(dt: number): void {
    if (this.velocity && this.velocity.length() > 0) {
      // apply velocity and see what happens
      const step = this.velocity.copy().scale(dt * 0.001);
      const newPoint = this._position.copy();
      newPoint.add(step);

      // create a temp new rect for collision testing
      const newRect = new rect();
      newRect.left = newPoint.x + this.tileData.collisionOffset.x;
      newRect.width = this._collision.width;
      newRect.height = this._collision.height;
      newRect.top = newPoint.y + this._collision.height + this.tileData.collisionOffset.y;

      // draw results
      if (this.lastCollisionResults) {
        for (let res of this.lastCollisionResults.intersectingTiles) {
          console.debug('removing uuid ' + res.uuid);
          res.drawCollision(null);
        }
      }
      this.lastCollisionResults = null;
      const results = this.eng.collisionManager.checkCollisionRect(this, newRect);
      if (results) {
        for (let res of results.intersectingTiles) {
          console.debug('drawing uuid   ' + res.uuid);
          res.drawCollision(new vec4([0, 1, 0, 1]));
        }
        this.lastCollisionResults = results;
      }

      newPoint.copy(this._position);
    }
  }

  protected adjustVelocity(collisionResults: CollisionResults): void {
    if (!collisionResults.hasCollision) {
      return;
    }

    for (let result of collisionResults.intersectingTiles) {
      // get the source edges that have start and end points that dot the velocity >0

      // for each other edge
      // if other edge dot velocity < 0
      // for each source edge that has velocity dot > 0
      // if other edge point intersect source edge or
      // source edge points intersect other edge
      // scale velocity
      if (this.velocity.x > 0) {
      }
    }
  }

  update(dt: number): void {
    this.moveAndSlide(dt);
  }
}
