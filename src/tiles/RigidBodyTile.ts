import { CollisionResults } from '../data/CollisionResults';
import edge2 from '../math/edge2';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { CollisionTile } from './CollisionTile';

export abstract class RigidBodyTile extends CollisionTile {
  velocity: vec3 = new vec3();

  private lastCollisionResults: CollisionResults;

  /**
   * keep track of this position locally so
   * that we can update each component later
   * @param position
   */
  setPosition(position: vec3): void {
    super.setPosition(position);
  }

  /**
   * Moves the rigid body by updating the position and adjusting for collision detection
   */
  protected moveAndSlide(dt: number): void {
    if (this.velocity && this.velocity.length() > 0) {
      let step = this.velocity.copy().scale(dt * 0.001);
      // copy the position
      const nextPosition = this.tilePosition.copy().add(step);

      const nextRect = this._bounds.copy();
      nextRect.left = nextPosition.x + this.collisionOffset.x;
      nextRect.top = nextPosition.y + this._bounds.height + this.collisionOffset.y;

      const results = this.eng.collisionManager.checkCollisionRect(this, nextRect);

      // for debug
      this.drawCollisionFromResults(results);

      // if there is a collision adjust the step
      if (results?.hasCollision()) {
        // let the other tiles know we hit them
        for (let otherTile of results.intersectingTiles) {
          otherTile.onCollision(this);
        }

        // this will change the velocity vector
        this.adjustVelocityStep(step, results, dt);
      } else {
        // move the tile
        this.setPosition(this.tilePosition.add(step));
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

    const smallCorrectionStep = 0.5;
    const maxCycles = 5;
    let clearVelocityX = false;
    let clearVelocityY = false;
    const isMovingRight = velocityStep.x > 0;
    const isMovingLeft = velocityStep.x < 0;
    const isMovingUp = velocityStep.y > 0;
    const isMovingDown = velocityStep.y < 0;
    const adjustedPosition = this.tilePosition.copy();

    // loop over this correct for multiple cycle to
    // avoid oscillating corrections with the position
    for (let cycles = 0; cycles < maxCycles; cycles++) {
      if (velocityStep.x != 0) {
        // offset the rect
        const myUpdatedRect = this.bounds.copy();
        myUpdatedRect.left += velocityStep.x;
        for (let result of collisionResults.intersectingTiles) {
          // is this an intersection worth adjusting
          const intersects = myUpdatedRect.intersects(result.bounds);
          const splitLeftEdge = myUpdatedRect.left < result.bounds.left;
          const splitRightEdge = myUpdatedRect.right > result.bounds.right;
          const splitCorrectEdge = isMovingRight ? splitLeftEdge : splitRightEdge;
          if (intersects && splitCorrectEdge) {
            clearVelocityX = true;

            // position to the edge of the other bounds
            if (velocityStep.x > 0) {
              // moving right
              const target = result.bounds.left - this._bounds.width;
              const dir = target - adjustedPosition.x;
              adjustedPosition.x += dir * smallCorrectionStep;
            } else {
              // moving left
              const target = result.bounds.right;
              const dir = target - adjustedPosition.x;
              adjustedPosition.x += dir * smallCorrectionStep;
            }
            this.updateCollision(adjustedPosition);
          }
        }
      }

      if (velocityStep.y != 0) {
        const myUpdatedRect = this.bounds.copy();
        myUpdatedRect.top += velocityStep.y;
        for (let result of collisionResults.intersectingTiles) {
          // limit the position here
          // is this an intersection worth adjusting
          const intersects = myUpdatedRect.intersects(result.bounds);
          const splitTopEdge = myUpdatedRect.top > result.bounds.top;
          const splitBottomEdge = myUpdatedRect.bottom < result.bounds.bottom;
          const splitCorrectEdge = isMovingUp ? splitBottomEdge : splitTopEdge;
          if (intersects && splitCorrectEdge) {
            clearVelocityY = true;
            // position to the edge of the other bounds
            if (velocityStep.y > 0) {
              // moving up
              const target = result.bounds.bottom - this._bounds.height;
              const dir = target - adjustedPosition.y;
              adjustedPosition.y += dir * smallCorrectionStep;
            } else {
              // moving down
              const target = result.bounds.top;
              const dir = target - adjustedPosition.y;
              adjustedPosition.y += dir * smallCorrectionStep;
            }
            this.updateCollision(adjustedPosition);
          }
        }
      }
    }

    if (clearVelocityX) {
      this.velocity.x = 0;
      velocityStep.x = 0;
    }

    if (clearVelocityY) {
      this.velocity.y = 0;
      velocityStep.y = 0;
    }

    // set the new corrected position
    this.setPosition(this.tilePosition.add(velocityStep));

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
    const intersection = edge.lineIntersection(staticEdge, true);
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
    if (true) {
      // draw results
      const start = this.bestStartPointForVelocity(this._bounds, this.velocity);
      const pixelLengthOfDebugLine = 10;
      const step = this.velocity.copy().normalize().scale(pixelLengthOfDebugLine);
      const nextPosition = start.copy().add(step);

      this.eng.debugHelpers.setLine(
        this.uuid,
        new vec3(...start.xy, 0),
        new vec3(...nextPosition.xy, 0),
        new vec4(1, 0, 0, 1)
      );

      if (this.lastCollisionResults) {
        for (let res of this.lastCollisionResults.intersectingTiles) {
          res.drawCollision(null);
        }
        this.drawCollision(null);
      }
      this.lastCollisionResults = null;
      if (results.hasCollision()) {
        const theirColor = new vec4(0, 1, 0, 1);
        const ourColor = new vec4(0, 0.5, 0.8, 1);
        for (let res of results.intersectingTiles) {
          res.drawCollision(theirColor);
        }
        this.drawCollision(ourColor);
        this.lastCollisionResults = results;
      }
    }
  }
}
