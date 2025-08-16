import { CollisionResults } from '../data/CollisionResults';
import { SpriteDirection } from '../data/SpriteDirection';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { TileController } from './TileController';

export class PlayerTile extends TileController {
  private _translation: vec3;
  private _facing: SpriteDirection;
  private _walking: boolean;
  private _walkingTimer: number;
  private _walkingTime = 200;
  private _walkingToggle: boolean;
  private _lastCollisionResults: CollisionResults;

  speed: number;

  async initialize(): Promise<void> {
    this._translation = new vec3();
    this.speed = 2;
    this._facing = SpriteDirection.South;

    this.eng.viewManager.setTarget(this.bottomLeft.x - this.eng.width / 2, this.bottomLeft.y - this.eng.height / 2);
  }

  update(dt: number): void {
    const dir = this.eng.inputManager.movingDirection(this.speed);
    this._translation.x = dir.x;
    this._translation.y = -dir.y;
    const walking = this._translation.length() > 0;

    // reset timer
    if (walking && !this._walking) {
      this._walkingTimer = 0;
      this._walkingToggle = false;
    }

    // if we are talking then walk
    this._walking = walking;
    if (this._walking) {
      this._walking = true;
      this.adjustSpriteDirection(dir);

      console.debug('player position ', this._collision.left.toFixed(0) + ', ' + this._collision.top.toFixed(0));

      this.setTranslation(this._translation);

      this.eng.viewManager.setTarget(this.bottomLeft.x - this.eng.width / 2, this.bottomLeft.y - this.eng.height / 2);

      this._walkingTimer -= dt;
    } else {
      this.adjustSpriteDirection(dir);
    }

    // is there a collision
    const results = this.eng.tileManager.checkCollision(this);

    // respond to the collision
    this.collisionResponse(results);

    const tilesToDisable = this._lastCollisionResults?.intersectingTiles.filter(
      (t) => !results.intersectingTiles.some((o) => o.uuid == t.uuid)
    );
    tilesToDisable?.forEach((tile) => tile.drawCollision(null));

    if (results.hasCollision()) {
      this.drawCollision(new vec4([1, 0, 0, 1]));
      results.intersectingTiles.forEach((t) => t.drawCollision(new vec4([0, 0, 1, 1])));
    } else {
      this.drawCollision(null);
    }

    this._lastCollisionResults = results;
  }

  adjustSpriteDirection(dir: vec2): void {
    if (dir.y == 0) {
      if (dir.x > 0) {
        this._facing = SpriteDirection.East;
      } else if (dir.x < 0) {
        this._facing = SpriteDirection.West;
      }
    } else if (dir.y < 0) {
      if (dir.x > 0) {
        this._facing = SpriteDirection.NorthEast;
      } else if (dir.x < 0) {
        this._facing = SpriteDirection.NorthWest;
      } else {
        this._facing = SpriteDirection.North;
      }
    } else if (dir.y > 0) {
      if (dir.x > 0) {
        this._facing = SpriteDirection.SouthEast;
      } else if (dir.x < 0) {
        this._facing = SpriteDirection.SouthWest;
      } else {
        this._facing = SpriteDirection.South;
      }
    }
    let imageName;
    let flip;
    switch (this._facing) {
      case SpriteDirection.North:
        imageName = 'up';
        break;
      case SpriteDirection.NorthEast:
        imageName = 'upLeft';
        flip = true;
        break;
      case SpriteDirection.East:
        imageName = 'left';
        flip = true;
        break;
      case SpriteDirection.SouthEast:
        imageName = 'downLeft';
        flip = true;
        break;
      case SpriteDirection.SouthWest:
        imageName = 'downLeft';
        break;
      case SpriteDirection.West:
        imageName = 'left';
        break;
      case SpriteDirection.NorthWest:
        imageName = 'upLeft';
        break;
      case SpriteDirection.South:
      default:
        imageName = 'down';
        break;
    }
    if (this._walkingTimer <= 0) {
      this._walkingTimer = this._walkingTime;
      this._walkingToggle = !this._walkingToggle;
    }

    const standingStill = dir.length() == 0;
    if (standingStill) {
      this._walkingToggle = false;
    }

    if (imageName != 'up') {
      this.setImage(imageName + (this._walkingToggle ? 'Step' : ''), { flipX: flip });
    } else {
      this.setImage(imageName, { flipX: this._walkingToggle });
    }
  }
}
