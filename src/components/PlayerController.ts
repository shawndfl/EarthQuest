import { Curve } from '../core/Curve';
import { Engine } from '../core/Engine';
import { ISpriteData } from '../core/ISpriteData';
import { SpriteFlip } from '../core/Sprite';
import { Texture } from '../core/Texture';
import { UserAction } from '../core/UserAction';
import { SpritController } from '../environment/SpriteController';
import vec2 from '../math/vec2';
import { Component } from './Component';

export enum MoveDirection {
  N,
  NE,
  E,
  SE,
  S,
  SW,
  W,
  NW,
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

  get position(): vec2 {
    return this._position;
  }

  constructor(eng: Engine) {
    super(eng);
    this._walkDirection = MoveDirection.S;
    this._walking = false;
    this._speed = 80; // pixels per second

    // set the start position
    this._position = new vec2([0, 0]);
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    this._spriteController = new SpritController(this.eng);
    this._spriteController.initialize(spriteSheet, characterData);
    // set the position of the sprite in the center of the screen
    this._position = new vec2([400, 185]);

    this._spriteController.setSpritePosition(
      this._position.x,
      this._position.y,
      0
    );
    this._spriteController.scale(5);
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

    if (action == UserAction.Left) {
      this._walkDirection = MoveDirection.W;
      this._walking = true;
    } else if (action == UserAction.Right) {
      this._walkDirection = MoveDirection.E;
      this._walking = true;
    } else if (action == UserAction.Up) {
      this._walkDirection = MoveDirection.N;
      this._walking = true;
    } else if (action == UserAction.Down) {
      this._walkDirection = MoveDirection.S;
      this._walking = true;
    }

    if (action == UserAction.LeftPressed) {
      this._walking = false;
    } else if (action == UserAction.RightPressed) {
      this._walking = false;
    } else if (action == UserAction.UpPressed) {
      this._walking = false;
    } else if (action == UserAction.DownPressed) {
      this._walking = false;
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
    let sprites = ['ness.down.step.left', 'ness.down.step.right'];
    let flip: boolean = false;
    const dir = new vec2([0, 0]);

    switch (direction) {
      case MoveDirection.E:
        sprites = ['ness.left.stand', 'ness.left.step'];
        flip = true;
        dir.x = 1;
        break;
      case MoveDirection.W:
        sprites = ['ness.left.stand', 'ness.left.step'];
        dir.x = -1;
        break;
      case MoveDirection.S:
        sprites = ['ness.down.step.left', 'ness.down.step.right'];
        dir.y = 1;

        break;
      case MoveDirection.N:
        sprites = ['ness.up.step', 'ness.up.step'];
        if (this._walkAnimation.getValue() == 0) {
          flip = true;
        }
        dir.y = -1;
        break;
    }

    // only move if we are walking
    if (this._walking) {
      const aspectRatio = this.gl.canvas.width / this.gl.canvas.height;

      //let newPos = this._position.add(dir.scale((dt / 1000.0) * this._speed));
      let newPos = new vec2();
      newPos.x =
        this._position.x + dir.x * (dt / 1000.0) * this._speed * aspectRatio;
      newPos.y =
        this._position.y +
        dir.y * (dt / 1000.0) * this._speed * (1.0 / aspectRatio);
      console.debug('pos ' + newPos.x + ', ' + newPos.y);

      // move the player
      this._spriteController.setSpritePosition(
        newPos.x,
        newPos.y,
        undefined,
        true
      );

      this._position = newPos;
    }

    // toggle and animation
    if (this._walkAnimation.getValue() == 0) {
      this._spriteController.setFlip(flip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(sprites[0], true);
    } else if (this._walkAnimation.getValue() == 1) {
      this._spriteController.setFlip(flip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(sprites[1], true);
    }
  }
}
