import { CollisionResults } from '../data/CollisionResults';
import edge2 from '../math/edge2';
import rect from '../math/rect';
import vec2 from '../math/vec2';
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
      let step = this.velocity.copy().scale(dt * 0.001);
      const nextPosition = this.position.copy().add(step);

      const nextRect = this._bounds.copy();
      nextRect.left = nextPosition.x + this.tileData.collisionOffset.x;
      nextRect.top = nextPosition.y + this._bounds.height + this.tileData.collisionOffset.y;

      //TODO create a velocity vector from this.bestStartPointForVelocity
      // see if it intersect an edge or a collision box using finite intersection test.
      //
      // If it does not really intersect then try two other points from the other edge. This way
      // we will know if there really is something in front of it. If they intersect the collision edge
      //
      //

      const results = this.eng.collisionManager.checkCollisionRect(this, nextRect);

      // for debug
      this.drawCollisionFromResults(results);

      // if there is a collision adjust the step
      if (results?.hasCollision()) {
        // this will change the velocity vector
        this.adjustVelocityStep(step, results, dt);
      } else {
        // move the tile
        this.position.add(step);
        this.updateCollision();
      }
    }
  }

  /**
   * Calculate the next step given a velocity and time
   * @param velocity
   * @param currentPosition
   * @param dt
   * @returns
   */
  protected velocityStep(velocity: vec3, currentPosition: vec3, dt: number): vec3 {
    const step = velocity.copy().scale(dt * 0.001);
    const newPoint = currentPosition.copy();
    newPoint.add(step);
    return newPoint;
  }

  /**
   * Gets the corrected velocity step
   * @param collisionResults
   * @param dt
   * @returns
   */
  protected adjustVelocityStep(velocityStep: vec3, collisionResults: CollisionResults, dt: number): void {
    if (!collisionResults.hasCollision) {
      return;
    }
    const velocity2d = new vec2(this.velocity.xy);
    const velocity2dNormal = velocity2d.copy().normalize();
    const myEdges = this.bounds.getEdges().filter((e) => vec2.dot(e.normal, velocity2dNormal) > 0);

    let xLimit = Number.MAX_VALUE;
    let yLimit = Number.MAX_VALUE;
    let posX: number;
    let posY: number;

    // find the right and up limit
    for (let result of collisionResults.intersectingTiles) {
      // get all edges that are facing away
      const theirEdges = result.bounds.getEdges().filter((e) => vec2.dot(e.normal, velocity2dNormal) < 0);
      for (let myEdge of myEdges) {
        const isRightAxis = Math.abs(vec2.dot(myEdge.normal, vec2.right)) > 0.999;
        const isUpAxis = Math.abs(vec2.dot(myEdge.normal, vec2.up)) > 0.999;

        for (let theirEdge of theirEdges) {
          // no slopes
          const match = vec2.dot(myEdge.normal, theirEdge.normal) < -0.99;
          if (match) {
            const distance = myEdge.DistanceToSegment(theirEdge);
            if (isRightAxis) {
              if (distance < Math.abs(velocityStep.x)) {
                xLimit = Math.min(myEdge.DistanceToSegment(theirEdge), xLimit);
                posX = theirEdge.start.x;
              }
            } else if (isUpAxis) {
              if (distance < Math.abs(velocityStep.y)) {
                yLimit = Math.min(myEdge.DistanceToSegment(theirEdge), yLimit);
                posY = theirEdge.start.y;
              }
            }
          }
        }
      }
    }
    // update position with the step
    this.position.add(velocityStep);

    // limit the position here
    if (xLimit < Number.MAX_VALUE) {
      // no velocity on this axis
      this.velocity.x = 0;
      this.position.x = posX - (velocityStep.x > 0 ? this._bounds.width : 0);
    }
    if (yLimit < Number.MAX_VALUE) {
      // no velocity on this axis
      this.velocity.y = 0;
      this.position.y = posY - (velocityStep.y > 0 ? this._bounds.height : 0);
    }

    // update collision
    this.updateCollision();
  }

  /**
   * This function will move the edge along a static edge.
   * If there is an intersection the edge will be projected on
   * the static edge then adjust the end point so that the magnitude is
   * preserved and there is not intersection with the static edge.
   * @param edge
   * @param staticEdge
   * @returns
   */
  protected slideEdge(edge: edge2, staticEdge: edge2): edge2 {
    const intersection = edge.Intersects(staticEdge);
    if (intersection) {
      const toEnd = new edge2(intersection.x, intersection.y, edge.end.x, edge.end.y);
      let scale = vec2.dot(toEnd.directionFull(), staticEdge.direction());
      let staticDirection = staticEdge.direction();

      // get the positive scale and flip direction if needed
      if (scale < 0) {
        scale *= -1;
        //staticDirection.scale(-1);
      }
      // adjust the edge's direction by the project
      staticDirection.scale(scale);

      const point2 = intersection.copy().add(staticDirection);
      edge.end = point2;
      edge.updateNormal();
    }
    return edge;
  }

  /**
   * Calculates a point at the edge of a rect where the velocity vector can start from.
   * @param rect
   * @param velocity
   * @returns
   */
  private bestStartPointForVelocity(rect: rect, velocity: vec3): vec2 {
    const normalized = velocity.copy().normalize();
    const x = rect.centerX + normalized.x * rect.width;
    const y = rect.centerY + normalized.y * rect.height;
    return new vec2(x, y);
  }

  update(dt: number): void {
    this.moveAndSlide(dt);
  }

  /**
   * Draw some debug stuff for collision detection
   * @param results
   */
  private drawCollisionFromResults(results: CollisionResults): void {
    // draw results
    const start = this.bestStartPointForVelocity(this._bounds, this.velocity);
    const pixelLengthOfDebugLine = 10;
    const step = this.velocity.copy().normalize().scale(pixelLengthOfDebugLine);
    const nextPosition = start.copy().add(step);

    this.eng.debugHelpers.setLine(
      this.uuid,
      new vec3(...start.xy, 0),
      new vec3(...nextPosition.xy, 0),
      new vec4([1, 0, 0, 1])
    );

    if (this.lastCollisionResults) {
      for (let res of this.lastCollisionResults.intersectingTiles) {
        res.drawCollision(null);
      }
      this.drawCollision(null);
    }
    this.lastCollisionResults = null;
    if (results.hasCollision()) {
      const theirColor = new vec4([0, 1, 0, 1]);
      const ourColor = new vec4([0, 0.5, 0.8, 1]);
      for (let res of results.intersectingTiles) {
        res.drawCollision(theirColor);
      }
      this.drawCollision(ourColor);
      this.lastCollisionResults = results;
    }
  }
}
