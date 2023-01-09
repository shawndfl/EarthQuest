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
  protected _walkDirection: MoveDirection;
  private _walking: boolean;
  protected _walkAnimation: Curve;
  private _speed: number;
  private _sprites: string[];
  private _spriteFlip: boolean;
  private _slopVector: vec2;

  /** the height above sea level of the player */
  private _playerHeight: number;

  get id(): string {
    return 'player';
  }

  get type(): string {
    return 'player';
  }

  get height(): number {
    return this._playerHeight;
  }

  set slopVector(val: vec2) {
    this._slopVector = val;
  }

  get slopVector(): vec2 {
    return this._slopVector;
  }

  constructor(eng: Engine) {
    super(eng);
    this._walkDirection = MoveDirection.S;
    this._walking = false;
    this._speed = 3.0; // tiles per second
    this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
    this._spriteFlip = false;
    this._playerHeight = 0;
    this._slopVector = new vec2([0, 0]);
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    this._spriteController = new SpritController(this.eng);
    this._spriteController.initialize(spriteSheet, characterData);

    this._spriteController.scale(2);
    this._spriteController.setSprite('ness.left.stand');
    // set the position of the sprite in the center of the screen
    this.setTilePosition(4, 5, 1);

    this._spriteController.commitToBuffer();

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
  handleUserAction(action: UserAction): boolean {
    const wasWalking = this._walking;

    //console.debug('action ' + action + ' was walking ' + wasWalking);
    this._walkDirection = MoveDirection.None;
    this._walking = false;
    if ((action & UserAction.Left) > 0) {
      this._walkDirection = this._walkDirection | MoveDirection.W;
      this._walking = true;
    }
    if ((action & UserAction.Right) > 0) {
      this._walkDirection = this._walkDirection | MoveDirection.E;
      this._walking = true;
    }
    if ((action & UserAction.Up) > 0) {
      this._walkDirection = this._walkDirection | MoveDirection.N;
      this._walking = true;
    }
    if ((action & UserAction.Down) > 0) {
      this._walkDirection = this._walkDirection | MoveDirection.S;
      this._walking = true;
    }

    // We are now walking start the animations
    if (!wasWalking && this._walking) {
      this._walkAnimation.start(true);
    } else if (!this._walking) {
      this._walkAnimation.pause(0);
    }

    return true;
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this._walkAnimation.update(dt);

    this.walkAnimation(dt, this._walkDirection);
  }

  walkAnimation(dt: number, direction: MoveDirection) {
    const dir = new vec2([0, 0]);

    if (direction != 0) {
      //console.debug('direction ' + direction);
    }
    if ((direction & MoveDirection.E) > 0) {
      this._sprites = ['ness.left.stand', 'ness.left.step'];
      this._spriteFlip = true;
      dir.x = 1;
    }
    if ((direction & MoveDirection.W) > 0) {
      this._sprites = ['ness.left.stand', 'ness.left.step'];
      this._spriteFlip = false;
      dir.x = -1;
    }
    if ((direction & MoveDirection.S) > 0) {
      this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
      this._spriteFlip = false;
      dir.y = -1;
    }
    if ((direction & MoveDirection.N) > 0) {
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
      const tileVector =
        this.eng.tileManger.screenVectorToTileSpace(moveVector);

      console.debug(
        'slop ' + moveVector.z,
        ' slop vector: ' +
          this._slopVector.toString() +
          ' dir ' +
          dir.toString()
      );
      // screen space converted to tile space for x and y position (ground plane)
      // then use the movement dot of the slope vector which will allow the player for
      // move up and down on stairs and slops
      this.OffsetTilePosition(
        tileVector.x,
        tileVector.y,
        vec2.dot(dir, this._slopVector)
      );
    }

    // toggle and animation. This can happen when not walking too.
    if (this._walkAnimation.getValue() == 0) {
      this._spriteController.setFlip(
        this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None
      );
      this._spriteController.setSprite(this._sprites[0], true);
    } else if (this._walkAnimation.getValue() == 1) {
      this._spriteController.setFlip(
        this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None
      );
      this._spriteController.setSprite(this._sprites[1], true);
    }
  }
}
