import { Curve } from '../math/Curve';
import { Engine } from '../core/Engine';
import { SpriteFlip } from '../graphics/Sprite';
import { UserAction } from '../core/UserAction';
import { SpritController } from '../graphics/SpriteController';
import vec2 from '../math/vec2';
import { TileComponent } from './TileComponent';
import vec3 from '../math/vec3';
import { InputState } from '../core/InputHandler';
import { AutoMoveController } from './AutoMoveController';
import { ILevelData } from '../environment/ILevelData';
import { TileContext } from './TileContext';

export enum PointingDirection {
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

  /** The sprite controller for the player */
  protected _spriteController: SpritController;

  /** Can the player walk */
  protected _canWalk: boolean;

  protected _attacking: boolean;

  get attacking(): boolean {
    return this._attacking;
  }

  get canWalk(): boolean {
    return this._canWalk;
  }

  /** */
  set canWalk(value: boolean) {
    this._canWalk = value;
    // stop the player from walking and animating
    if (!value) {
      this._walking = false;
      this._walkAnimation.pause(0);
    }
  }

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

  get facingDirection(): PointingDirection {
    return this._facingDirection;
  }

  constructor(eng: Engine) {
    super(eng, null);
    this.resetPlayer();
  }

  private resetPlayer() {
    this._facingDirection = PointingDirection.S;
    this._walking = false;
    this._speed = 3.0; // tiles per second
    this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
    this._spriteFlip = false;
    this._resetFlip = false;
    this._walkingDirection = new vec3([0, 0, 0]);
    this._moveController = new AutoMoveController(this.eng);
    this._canWalk = true;
  }

  initialize() {
    const texture = this.eng.assetManager.character.texture;
    const data = this.eng.assetManager.character.data;
    this._spriteController = new SpritController(this.eng);
    this._spriteController.initialize(texture, data);

    this._spriteController.scale(2);
    this._spriteController.setSprite('ness.left.stand');

    this._walkAnimation = new Curve();
    this._walkAnimation
      .points([
        { p: 1, t: 0 },
        { p: 0, t: 150 },
        { p: 1, t: 300 },
      ])
      .repeat(-1);

    this._attackAnimation = new Curve();
    this._attackAnimation.points([
      { p: 0, t: 0 },
      { p: 1, t: 50 },
      { p: 2, t: 100 },
      { p: 3, t: 150 },
    ]);
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    // the player is taking over now
    this._moveController.cancelMove();

    //console.debug('action ' + action + ' was walking ' + wasWalking);
    this._walking = false;

    // if the player cannot walk don;t let them
    if (!this.canWalk) {
      return true;
    }

    // if the user tapped or clicked on the screen
    if (state.isDown(UserAction.A)) {
      this._attacking = true;
      this.raiseAction(false);
    } else if (state.isReleased(UserAction.A)) {
      this.raiseAction(true);
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

    // We are now walking start the animations
    if (!this._wasWalking && this._walking) {
      this._walkAnimation.start(true);
    } else if (!this._walking) {
      this._walkAnimation.pause(0);
      // this is needed for resetting the walk
      // animation when facing north.
      // we do not want to reset flip when the
      // player is facing right or left
      if (this._resetFlip) {
        this._spriteFlip = false;
      }
    }

    return true;
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this._moveController.update(dt);

    if (!this.attackAnimation(dt, this._facingDirection)) {
      this.walkAnimation(dt, this._facingDirection);
    }
  }

  attackAnimation(dt: number, direction: PointingDirection): boolean {
    this._attackAnimation.update(dt);
    if (this._attacking) {
      if (!this._attackAnimation.isRunning()) {
        this._attackAnimation.start(true, () => {
          this._attacking = false;
        });
      }
      if ((direction & PointingDirection.S) > 0) {
        this._sprites = ['ness.down.swing.0', 'ness.down.swing.1', 'ness.down.swing.2'];
        this._spriteFlip = false;
      } else {
        // error handling
        this._sprites = ['ness.scared', 'ness.scared', 'ness.scared'];
        this._spriteFlip = false;
      }

      this._spriteController.flip(SpriteFlip.None);
      this._spriteController.setSprite(this._sprites[this._attackAnimation.getValue()]);
      return true;
    }
    return false;
  }

  walkAnimation(dt: number, direction: PointingDirection): void {
    this._walkAnimation.update(dt);

    this._resetFlip = false;

    // check multiple angle movements first so the else statements work correctly
    if ((direction & PointingDirection.S) > 0 && (direction & PointingDirection.W) > 0) {
      this._sprites = ['ness.down.left.stand', 'ness.down.left.step'];
      this._spriteFlip = false;
    } else if ((direction & PointingDirection.S) > 0 && (direction & PointingDirection.E) > 0) {
      this._sprites = ['ness.down.left.stand', 'ness.down.left.step'];
      this._spriteFlip = true;
    } else if ((direction & PointingDirection.N) > 0 && (direction & PointingDirection.W) > 0) {
      this._sprites = ['ness.up.left.stand', 'ness.up.left.step'];
      this._spriteFlip = false;
    } else if ((direction & PointingDirection.N) > 0 && (direction & PointingDirection.E) > 0) {
      this._sprites = ['ness.up.left.stand', 'ness.up.left.step'];
      this._spriteFlip = true;
    } else if ((direction & PointingDirection.E) > 0) {
      this._sprites = ['ness.left.stand', 'ness.left.step'];
      this._spriteFlip = true;
    } else if ((direction & PointingDirection.W) > 0) {
      this._sprites = ['ness.left.stand', 'ness.left.step'];
      this._spriteFlip = false;
    } else if ((direction & PointingDirection.S) > 0) {
      this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
      this._spriteFlip = false;
    } else if ((direction & PointingDirection.N) > 0) {
      this._sprites = ['ness.up.step', 'ness.up.step'];
      this._spriteFlip = false;
      this._resetFlip = true;
      if (this._walkAnimation.getValue() == 1) {
        this._spriteFlip = true;
      }
    }

    // only move if we are walking
    if (this._walking) {
      // scale velocity by time
      const moveVector = this._walkingDirection.scale(dt / 1000.0);

      // screen space converted to tile space for x and y position (ground plane)
      // then use the movement dot of the slope vector which will allow the player for
      // move up and down on stairs and slops
      this.groundManager.placeTileOn(this, moveVector.x, moveVector.y);
    }

    // toggle and animation. This can happen when not walking too.
    if (this._walkAnimation.getValue() == 0) {
      this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(this._sprites[0]);
    } else if (this._walkAnimation.getValue() == 1) {
      this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(this._sprites[1]);
    }

    this._wasWalking = this._walking;
  }

  protected updateSpritePosition() {
    super.updateSpritePosition();

    // update the view manger with the player new position
    this.eng.viewManager.setTarget(
      this.screenPosition.x - this.eng.width * 0.5,
      -this.eng.height * 0.5 + this.screenPosition.y
    );
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    if (tileComponent.type == 'enemy') {
      return true;
    } else {
      return false;
    }
  }

  onEnter(tileComponent: TileComponent, context: TileContext): void {
    if (tileComponent.type == 'enemy') {
      this.eng.battleManager.queueNextBattle({
        enemies: [
          {
            id: 'test',
            tile: [10, 20],
          },
        ],
      });
    }
  }

  /**
   *
   * @param keyRelease - was the key just released or is it currently down
   */
  protected raiseAction(keyReleased: boolean) {
    const i = this.tileIndex.x;
    const j = this.tileIndex.y;
    const k = this.tileIndex.z;
    const ground = this.eng.ground;
    const direction = this.facingDirection;

    ground.getTile(i, j, k).onPlayerAction(this, keyReleased);
    // Check 3 tiles around the direction the player is facing
    if ((direction & PointingDirection.E) > 0) {
      ground.getTile(i + 0, j + 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 1, j + 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 1, j + 0, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 1, j - 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 0, j - 1, k).onPlayerAction(this, keyReleased);
    } else if ((direction & PointingDirection.W) > 0) {
      ground.getTile(i - 0, j + 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i - 1, j + 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i - 1, j + 0, k).onPlayerAction(this, keyReleased);
      ground.getTile(i - 1, j - 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i - 0, j - 1, k).onPlayerAction(this, keyReleased);
    } else if ((direction & PointingDirection.S) > 0) {
      ground.getTile(i - 1, j + 0, k).onPlayerAction(this, keyReleased);
      ground.getTile(i - 1, j + 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 0, j + 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 1, j + 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 1, j + 0, k).onPlayerAction(this, keyReleased);
    } else if ((direction & PointingDirection.N) > 0) {
      ground.getTile(i - 1, j - 0, k).onPlayerAction(this, keyReleased);
      ground.getTile(i - 1, j - 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 0, j - 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 1, j - 1, k).onPlayerAction(this, keyReleased);
      ground.getTile(i + 1, j - 0, k).onPlayerAction(this, keyReleased);
    }

    // this should not happen but just in case
    ground.getTile(i, j, k).onPlayerAction(this, keyReleased);
  }

  loadLevel(level: ILevelData): void {}

  closeLevel(): void {
    this.resetPlayer();
  }
}
