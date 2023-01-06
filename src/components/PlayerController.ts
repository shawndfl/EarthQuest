import { Curve } from '../core/Curve';
import { Engine } from '../core/Engine';
import { ISpriteData } from '../core/ISpriteData';
import { SpriteFlip } from '../core/Sprite';
import { Texture } from '../core/Texture';
import { UserAction } from '../core/UserAction';
import { SpritController } from '../environment/SpriteController';
import vec2 from '../math/vec2';
import { Component } from './Component';
import * as MathConst from '../math/constants';
import { TileManager } from '../core/TileManager';

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
export class PlayerController extends Component {
  protected _spriteController: SpritController;
  protected _walkDirection: MoveDirection;
  private _walking: boolean;
  protected _walkAnimation: Curve;
  private _position: vec2;
  private _speed: number;
  private _sprites: string[];
  private _spriteFlip: boolean;

  /** the height above sea level of the player */
  private _playerHeight: number;

  get height(): number {
    return this._playerHeight;
  }

  get position(): vec2 {
    return this._position;
  }

  constructor(eng: Engine) {
    super(eng);
    this._walkDirection = MoveDirection.S;
    this._walking = false;
    this._speed = 80; // pixels per second
    this._sprites = ['ness.down.step.left', 'ness.down.step.right'];
    this._spriteFlip = false;
    this._playerHeight = 0;

    // set the start position
    this._position = new vec2([0, 0]);
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    this._spriteController = new SpritController(this.eng);
    this._spriteController.initialize(spriteSheet, characterData);
    // set the position of the sprite in the center of the screen
    this._position = new vec2([400, 580]);

    this._spriteController.setSpritePosition(
      this._position.x,
      this._position.y,
      -1
    );
    this._spriteController.scale(2);
    this._spriteController.setSprite('ness.left.stand');
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
      const aspectRatio = this.gl.canvas.width / this.gl.canvas.height;

      let newPos = new vec2();
      newPos.x =
        this._position.x + dir.x * (dt / 1000.0) * this._speed * aspectRatio;
      newPos.y =
        this._position.y +
        dir.y * (dt / 1000.0) * this._speed * (1.0 / aspectRatio);

      // TODO need to calculate height
      const depth = (newPos.y / this.eng.height) * 2 - 1;

      // we need to know what tile the player is on
      const tile = this.eng.tileManger.toTileLoc(newPos.x, newPos.y, depth);

      console.debug(
        '\n  pos ' +
          newPos.toString() +
          ', ' +
          depth.toFixed(5) +
          '\ncell[' +
          tile.i.toFixed(5) +
          ', ' +
          tile.j.toFixed(5) +
          ', ' +
          tile.k.toFixed(5)
      );

      // recalculated the screen position to get the correct depth for the sprite
      const screen = this.eng.tileManger.toScreenLoc(
        tile.i,
        tile.j,
        tile.k + this._playerHeight
      );

      // we need this to be an int to lookup the tiles
      tile.i = Math.round(tile.i);
      tile.j = Math.round(tile.j);
      tile.k = Math.floor(tile.k); // just take the floor, b/c this is the floor

      // check if the player can access this tile
      if (this.eng.scene.ground.canAccessTile(tile.i, tile.j, tile.k)) {
        this.eng.scene.ground.onExit(tile.i, tile.j, tile.k);
        this.eng.scene.ground.onEnter(tile.i, tile.j, tile.k);

        // move the player
        this._spriteController.setSpritePosition(
          screen.x,
          screen.y,
          -1,
          -1,
          true
        );

        this._position = newPos;
      }
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
