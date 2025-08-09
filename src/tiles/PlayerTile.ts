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

  speed: number;

  async initialize(): Promise<void> {
    this._translation = new vec3();
    this.speed = 0.2;
    this._facing = SpriteDirection.South;
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

      this.quad.transform.getTranslation(this._quadPosition);

      /*
      console.debug(
        'player collision ',
        this._collision.left.toFixed(0) +
          ', ' +
          this._collision.top.toFixed(0) +
          ', ' +
          this._collision.width.toFixed(0) +
          ', ' +
          this._collision.height.toFixed(0) +
          ', '
      );
      */

      this.quad.transform.translate(this._translation);
      this.quad.transform.getTranslation(this._quadPosition);
      this._collision.left = this._quadPosition.x;
      this._collision.width = (this.tileData.tileSize?.x ?? this.tileData.sourceSize.x) * this.eng.pixelScale;
      this._collision.height = (this.tileData.tileSize?.y ?? this.tileData.sourceSize.y) * this.eng.pixelScale;
      this._collision.top = this._quadPosition.y;

      this.eng.debugHelpers.setRect('player', this._collision, new vec4([1, 0, 0, 1]));

      this.eng.viewManager.setTarget(
        this._quadPosition.x - this.eng.width / 2,
        this._quadPosition.y - this.eng.height / 2
      );
      this.options.drawingLayer.requestRefresh();

      this._walkingTimer -= dt;
    } else {
      this.adjustSpriteDirection(dir);
    }
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
      this.setImage(imageName + (this._walkingToggle ? 'Step' : ''), flip);
    } else {
      this.setImage(imageName, this._walkingToggle);
    }
  }
}
