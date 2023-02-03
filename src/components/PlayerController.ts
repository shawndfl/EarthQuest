import { Curve } from '../math/Curve';
import { Engine } from '../core/Engine';
import { ISpriteData } from '../graphics/ISpriteData';
import { SpriteFlip } from '../graphics/Sprite';
import { Texture } from '../graphics/Texture';
import { UserAction } from '../core/UserAction';
import { SpritController } from '../graphics/SpriteController';
import vec2 from '../math/vec2';
import { TileComponent } from './TileComponent';
import vec3 from '../math/vec3';
import { InputState } from '../core/InputHandler';

export enum MoveDirection {
  None = 0x00,
  N = 0x01,
  E = 0x02,
  S = 0x04,
  W = 0x08,
}
/**
 * Controls the player sprite.
 */
export class PlayerController extends TileComponent {
  /** The direction the player is facing */
  protected _walkDirection: MoveDirection;
  /** is the player walking */
  private _walking: boolean;
  /** the walk animation. This is just two frames */
  protected _walkAnimation: Curve;
  /** The speed the player can walk at */
  private _speed: number;
  /** Used for animations */
  private _sprites: string[];
  /** Should the sprites be flipped */
  private _spriteFlip: boolean;
  /** the slop vector for moving up or down in height. This is set from the environment */
  private _slopVector: vec2;

  /** The sprite controller for the player */
  protected _spriteController: SpritController;

  /**
   * Get the sprite controller
   */
  get spriteController(): SpritController {
    return this._spriteController;
  }

  get id(): string {
    return 'player';
  }

  get type(): string {
    return 'player';
  }

  get heightIndex(): number {
    return this._tileIndex.z;
  }

  set slopVector(val: vec2) {
    this._slopVector = val;
  }

  get slopVector(): vec2 {
    return this._slopVector;
  }

  get moveDirection(): MoveDirection {
    return this._walkDirection;
  }

  constructor(eng: Engine) {
    super(eng);
    this._walkDirection = MoveDirection.S;
    this._walking = false;
    this._speed = 3.0; // tiles per second
    this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
    this._spriteFlip = false;
    this._slopVector = new vec2([0, 0]);
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    this._spriteController = new SpritController(this.eng);
    this._spriteController.initialize(spriteSheet, characterData);

    this._spriteController.scale(2);
    this._spriteController.setSprite('ness.left.stand');
    // set the position of the sprite in the center of the screen
    this.setTilePosition(4, 5, 1);

    this._walkAnimation = new Curve();
    this._walkAnimation
      .points([
        { p: 1, t: 0 },
        { p: 0, t: 150 },
        { p: 1, t: 300 },
      ])
      .repeat(-1);

    console.info('sprite list ', this._spriteController.getSpriteList());
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    const wasWalking = this._walking;

    //console.debug('action ' + action + ' was walking ' + wasWalking);
    this._walkDirection = MoveDirection.None;
    this._walking = false;
    this._moveTarget = null;

    // if the user tapped or clicked on the screen
    if ((state.action & UserAction.Tap) > 0) {
      this.handleTap(state);
    } else if ((state.action & UserAction.ActionPressed) > 0) {
      // action event
      this.eng.scene.ground.raisePlayerAction(this);
    } else if ((state.action & UserAction.MenuPressed) > 0) {
      this.eng.dialogManager.showGameMenu();
    } else {
      // use arrow keys or d-pad on a game controller
      if ((state.action & UserAction.Left) > 0) {
        this._walkDirection = this._walkDirection | MoveDirection.W;
        this._walking = true;
      }
      if ((state.action & UserAction.Right) > 0) {
        this._walkDirection = this._walkDirection | MoveDirection.E;
        this._walking = true;
      }
      if ((state.action & UserAction.Up) > 0) {
        this._walkDirection = this._walkDirection | MoveDirection.N;
        this._walking = true;
      }
      if ((state.action & UserAction.Down) > 0) {
        this._walkDirection = this._walkDirection | MoveDirection.S;
        this._walking = true;
      }
    }

    // We are now walking start the animations
    if (!wasWalking && this._walking) {
      this._walkAnimation.start(true);
    } else if (!this._walking) {
      this._walkAnimation.pause(0);
    }

    return true;
  }

  /**
   * Handle the tap event. This will allow the player to touch a point on the screen
   * and the character will walk towards that point. If the character can not get there in 2
   * seconds the character will stop moving. When the character gets to the destination the action
   * event will be raised automatically.
   * @param state
   */
  handleTap(state: InputState) {
    let touch = state.touchPoint;
    const scaleHeight = this.eng.height * this.eng.tileHelper.depthScale;

    const screen = new vec3();

    // x and y screen points are offset by the projection offset.
    screen.x = touch.x + this.eng.viewManager.screenX;
    screen.y = touch.y + this.eng.viewManager.screenY;

    console.debug('touch point ' + screen.toString());

    // this is offset based on the players height index
    const yOffset = screen.y + 8 * this.heightIndex;

    // the depth range is from 1 to -1, back to front. Calculate the z depth
    screen.z = (yOffset / scaleHeight - this.eng.height / scaleHeight) * 2 + 1;

    const touchTile = this.eng.tileHelper.toTileLoc(
      new vec3(screen.x, screen.y, screen.z),
      this.eng.viewManager.projection
    );

    const pos = new vec2();
    pos.x = this.screenPosition.x - this.eng.viewManager.screenX;
    pos.y = this.screenPosition.y - this.eng.viewManager.screenY;

    // get the direction of the movement based on the mouse cursor or touch point
    this._moveTarget = new vec3(screen.x, screen.y, 0); //touchTile;
    this._movingToTargetTimer = 0;
    console.debug('target ' + this._moveTarget.toString());
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this._walkAnimation.update(dt);

    this.walkToTarget(dt);

    this.walkAnimation(dt, this._walkDirection);
  }

  private _movingToTargetTimer: number;
  /** the target the character should move to */
  private _moveTarget: vec3;
  private _moveDirection: vec3;

  walkToTarget(dt: number) {
    const wasWalking = this._walking;

    if (this._moveTarget) {
      // reset direction and walking
      this._walkDirection = MoveDirection.None;
      this._walking = false;

      // increment timer
      this._movingToTargetTimer += dt;

      // get movement direction
      const playerScreen = this.screenPosition;
      const direction = this._moveTarget.copy().subtract(playerScreen);

      // did the player make it to the target or did the time expire
      if (direction.length() > 20.0 && this._movingToTargetTimer < 3000) {
        const dir = direction.copy();
        dir.normalize();

        const deadZone = 0.8;
        console.debug('t-> pos ' + playerScreen);
        console.debug('t-> target ' + this._moveTarget);
        console.debug('t-> direction ' + dir, direction.length().toFixed(3));

        // move left
        if (dir.x < -deadZone) {
          this._walkDirection = this._walkDirection | MoveDirection.W;
          this._walking = true;
          console.debug('t->  moving left ');
        }
        // move right
        else if (dir.x > deadZone) {
          this._walkDirection = this._walkDirection | MoveDirection.E;
          this._walking = true;
          console.debug('t->  moving right ');
        }

        // move down
        if (dir.y < -deadZone) {
          this._walkDirection = this._walkDirection | MoveDirection.S;
          this._walking = true;
          console.debug('t->  moving down ');
        }
        // move up
        else if (dir.y > deadZone) {
          this._walkDirection = this._walkDirection | MoveDirection.N;
          this._walking = true;
          console.debug('t->  moving up ');
        }

        // We are now walking start the animations
        if (!wasWalking && this._walking) {
          this._walkAnimation.start(true);
        } else if (!this._walking) {
          this._walkAnimation.pause(0);
        }
      } else {
        console.debug('done!!');
        // we are done moving so reset everything
        this._walking = false;
        this._walkDirection = MoveDirection.None;
        this._moveTarget = undefined;
        this._movingToTargetTimer = 0;
        this._walkAnimation.pause(0);
      }
    }
  }

  walkAnimation(dt: number, direction: MoveDirection) {
    const dir = new vec2([0, 0]);

    // check multiple angle movements first so the else statements work correctly
    if ((direction & MoveDirection.S) > 0 && (direction & MoveDirection.W) > 0) {
      this._sprites = ['ness.down.left.stand', 'ness.down.left.step'];
      this._spriteFlip = false;
      dir.x = -1;
      dir.y = -1;
    } else if ((direction & MoveDirection.S) > 0 && (direction & MoveDirection.E) > 0) {
      this._sprites = ['ness.down.left.stand', 'ness.down.left.step'];
      this._spriteFlip = true;
      dir.x = 1;
      dir.y = -1;
    } else if ((direction & MoveDirection.N) > 0 && (direction & MoveDirection.W) > 0) {
      this._sprites = ['ness.up.left.stand', 'ness.up.left.step'];
      this._spriteFlip = false;
      dir.x = -1;
      dir.y = 1;
    } else if ((direction & MoveDirection.N) > 0 && (direction & MoveDirection.E) > 0) {
      this._sprites = ['ness.up.left.stand', 'ness.up.left.step'];
      this._spriteFlip = true;
      dir.x = 1;
      dir.y = 1;
    } else if ((direction & MoveDirection.E) > 0) {
      this._sprites = ['ness.left.stand', 'ness.left.step'];
      this._spriteFlip = true;
      dir.x = 1;
    } else if ((direction & MoveDirection.W) > 0) {
      this._sprites = ['ness.left.stand', 'ness.left.step'];
      this._spriteFlip = false;
      dir.x = -1;
    } else if ((direction & MoveDirection.S) > 0) {
      this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
      this._spriteFlip = false;
      dir.y = -1;
    } else if ((direction & MoveDirection.N) > 0) {
      this._sprites = ['ness.up.step', 'ness.up.step'];
      this._spriteFlip = false;
      if (this._walkAnimation.getValue() == 0) {
        this._spriteFlip = true;
      }
      dir.y = 1;
    }

    // only move if we are walking
    if (this._walking) {
      const moveVector = new vec3(
        dir.x * (dt / 1000.0) * this._speed,
        dir.y * (dt / 1000.0) * this._speed,
        vec2.dot(dir, this._slopVector)
      );

      // convert movement vector from screen space to tile space
      const tileVector = this.eng.tileHelper.rotateToTileSpace(moveVector);

      // screen space converted to tile space for x and y position (ground plane)
      // then use the movement dot of the slope vector which will allow the player for
      // move up and down on stairs and slops
      this.OffsetTilePosition(tileVector.x, tileVector.y, vec2.dot(dir, this._slopVector));
    }

    // toggle and animation. This can happen when not walking too.
    if (this._walkAnimation.getValue() == 0) {
      this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(this._sprites[0]);
    } else if (this._walkAnimation.getValue() == 1) {
      this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(this._sprites[1]);
    }
  }

  protected updateSpritePosition() {
    super.updateSpritePosition();

    console.debug('pos ' + this.tilePosition.toString() + '\n  : ' + this.screenPosition.toString());

    // update the view manger with the player new position
    this.eng.viewManager.setTarget(
      this.screenPosition.x - this.eng.width * 0.5,
      -this.eng.height * 0.5 + this.screenPosition.y
    );
  }
}
