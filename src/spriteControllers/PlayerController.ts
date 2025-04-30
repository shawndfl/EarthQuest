import { AutoMoveController } from '../components/AutoMoveController';
import { PointingDirection } from '../components/PlayerController';
import { InputState } from '../core/InputHandler';
import { UserAction } from '../core/UserAction';
import { Curve } from '../math/Curve';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { SpriteController } from './SpriteController';

export class PlayerController extends SpriteController {
  /** The direction the player is facing */
  protected _facingDirection: PointingDirection;
  /** is the player walking */
  private _walking: boolean;
  /** was the player walking last frame */
  private _wasWalking: boolean;
  /** the walk animation. This is just two frames */
  protected _walkAnimation: Curve;
  /** the attack animation. */
  protected _attackAnimation: Curve;
  /** The speed the player can walk at */
  private _speed: number;
  /** Used for animations */
  private _sprites: string[];
  /** Should the sprites be flipped */
  private _spriteFlip: boolean;
  /** Gives us more control over the animations */
  private _resetFlip: boolean;

  /** The direction the player is walking */
  private _walkingDirection: vec3;

  /** used to move the player when screen is tapped */
  private _moveController: AutoMoveController;

  /** Can the player walk */
  protected _canWalk: boolean;

  protected _attacking: boolean;

  requiresUpdate(): boolean {
    return true;
  }

  takesInput(): boolean {
    return true;
  }

  handleUserAction(state: InputState): boolean {
    // if the user tapped or clicked on the screen
    if (state.isDown(UserAction.A)) {
      //this._attacking = true;
      //this.raiseAction(false);
    } else if (state.isReleased(UserAction.A)) {
      //this.raiseAction(true);
    } else if ((state.buttonsReleased & UserAction.Start) > 0) {
      this.eng.dialogManager.showGameMenu();
    } else {
      // if an arrow key is pressed reset the facing direction
      if (
        state.isDown(UserAction.Left) ||
        state.isDown(UserAction.Right) ||
        state.isDown(UserAction.Up) ||
        state.isDown(UserAction.Down)
      ) {
        this._facingDirection = PointingDirection.None;
      }
      const screenDirection = new vec2();
      // use arrow keys or d-pad on a game controller
      if (state.isDown(UserAction.Left)) {
        this.calculateQuad();
        this._facingDirection = this._facingDirection | PointingDirection.W;
        screenDirection.x -= 1;
        this._walking = true;
      }
      if (state.isDown(UserAction.Right)) {
        this._facingDirection = this._facingDirection | PointingDirection.E;
        screenDirection.x += 1;
        this._walking = true;
      }
      if (state.isDown(UserAction.Up)) {
        this._facingDirection = this._facingDirection | PointingDirection.N;
        screenDirection.y += 1;
        this._walking = true;
      }
      if (state.isDown(UserAction.Down)) {
        this._facingDirection = this._facingDirection | PointingDirection.S;
        screenDirection.y -= 1;
        this._walking = true;
      }

      this._walkingDirection.x = screenDirection.x * this._speed;
      this._walkingDirection.y = screenDirection.y * this._speed;
      this._walkingDirection.z = 0;

      // convert movement vector from screen space to tile space
      this._walkingDirection = this.eng.tileHelper.rotateToTileSpace(this._walkingDirection);
    }
    return false;
  }

  /**
   * Initialize the player
   */
  initialize(): void {
    super.initialize();
  }

  /**
   * Called every frame
   * @param dt - delta time in ms
   */
  update(dt: number) {
    //console.debug('player update');
  }
}
