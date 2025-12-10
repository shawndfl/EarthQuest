import { SpriteDirection } from '../data/SpriteDirection';

import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { RigidBodyTile } from './RigidBodyTile';

export class PlayerTile extends RigidBodyTile {
  private _facing: SpriteDirection;
  private _walking: boolean;
  private _walkingTimer: number;
  private _walkingTime = 200;
  private _walkingToggle: boolean;

  speed: number;

  get facing(): SpriteDirection {
    return this._facing;
  }

  async initialize(): Promise<void> {
    await super.initialize();
    this.speed = 200; // 200 pixels per second
    this._facing = SpriteDirection.South;

    this.eng.viewManager.setTarget(this.bottomLeft.x - this.eng.width / 2, this.bottomLeft.y - this.eng.height / 2);
  }

  update(dt: number): void {
    const dir = this.eng.inputManager.movingDirection(this.speed);
    if (this.eng.dialogManager.dialogHasFocus()) {
      dir.reset();
    }
    this.velocity.x = dir.x;
    this.velocity.y = -dir.y;
    const walking = this.velocity.length() > 0;

    // call this after the velocity is set so that
    // the position is calculated corrected.
    super.update(dt);

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

      //console.debug('player position ', this._collision.left.toFixed(0) + ', ' + this._collision.top.toFixed(0));

      this.setPosition(this.position);

      this._walkingTimer -= dt;
    } else {
      this.adjustSpriteDirection(dir);
    }
  }

  setPosition(position: vec3): void {
    super.setPosition(position);
    this.eng.viewManager.setTarget(this.bottomLeft.x - this.eng.width / 2, this.bottomLeft.y - this.eng.height / 2);
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
