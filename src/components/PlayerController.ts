import { Engine } from '../core/Engine';
import { ISpriteData } from '../core/ISpriteData';
import { SpriteFlip } from '../core/Sprite';
import { Texture } from '../core/Texture';
import { UserAction } from '../core/UserAction';
import { SpritController } from '../environment/SpriteController';
import { Component } from './Component';

export enum SpriteDirection {
  Up,
  Down,
  Right,
  Left,
}
/**
 * Controls the player sprite.
 */
export class PlayerController extends Component {
  private _spriteController: SpritController;
  private _animationState: number;
  private _animationTimer: number;
  private _direction: SpriteDirection;
  private _spriteFlip: boolean;

  constructor(eng: Engine) {
    super(eng);
    this._spriteFlip = false;
    this._direction = SpriteDirection.Down;
    this._animationState = 0;
    this._animationTimer = 0;
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    this._spriteController = new SpritController(this.gl);
    this._spriteController.initialize(spriteSheet, characterData);
    this._spriteController.setSprite('ness.right.stand');
    console.info('sprite list ', this._spriteController.getSpriteList());
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(action: UserAction): boolean {
    if (action != UserAction.None) {
      console.log('player action ', action);
    }

    if (action == UserAction.Left) {
      this._direction = SpriteDirection.Left;
    } else if (action == UserAction.Right) {
      this._direction = SpriteDirection.Right;
    } else if (action == UserAction.Up) {
      this._direction = SpriteDirection.Up;
    } else if (action == UserAction.Down) {
      this._direction = SpriteDirection.Down;
    }
    return true;
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this.walkAnimation(dt, this._direction);
  }

  walkAnimation(dt: number, direction: SpriteDirection) {
    let sprites = ['ness.forward.step.left', 'ness.forward.step.right'];
    let flip: boolean = false;
    switch (direction) {
      case SpriteDirection.Right:
        sprites = ['ness.right.stand', 'ness.right.step'];
        break;
      case SpriteDirection.Left:
        sprites = ['ness.right.stand', 'ness.right.step'];
        flip = true;
        break;
    }

    // toggle and animation
    if (this._animationState == 0) {
      this._spriteController.setSprite(
        sprites[0],
        flip ? SpriteFlip.XFlip : SpriteFlip.None
      );
    } else if (this._animationState == 1) {
      this._spriteController.setSprite(
        sprites[1],
        flip ? SpriteFlip.XFlip : SpriteFlip.None
      );
    }

    this._animationTimer += dt;

    if (this._animationTimer > 500) {
      this._animationState++;

      // loop the state
      if (this._animationState > 1) {
        this._animationState = 0;
      }
      this._animationTimer = 0;
    }
  }
}
