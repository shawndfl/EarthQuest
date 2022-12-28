import { AnimationController } from '../core/AnimationController';
import { Engine } from '../core/Engine';
import { IAnimationData } from '../core/IAnimationData';
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
  protected _spriteController: SpritController;
  protected _animationState: number;
  protected _animationTimer: number;
  protected _direction: SpriteDirection;
  protected _spriteFlip: boolean;

  protected _walkAnimationData: IAnimationData;
  protected _animationController: AnimationController;

  constructor(eng: Engine) {
    super(eng);
    this._spriteFlip = false;
    this._direction = SpriteDirection.Down;
    this._animationState = 0;
    this._animationTimer = 0;

    this._animationController = new AnimationController(this._spriteController);
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    this._spriteController = new SpritController(this.eng);
    this._spriteController.initialize(spriteSheet, characterData);
    // set the position of the sprite in the center of the screen
    this._spriteController.setSpritePosition(200, 300, 0);
    this._spriteController.scale(5);
    this._spriteController.setSprite('ness.left.stand');
    this._spriteController.commitToBuffer();

    console.info('sprite list ', this._spriteController.getSpriteList());
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(action: UserAction): boolean {
    if (action == UserAction.LeftPressed) {
      this._direction = SpriteDirection.Left;
    } else if (action == UserAction.RightPressed) {
      this._direction = SpriteDirection.Right;
    } else if (action == UserAction.UpPressed) {
      this._direction = SpriteDirection.Up;
    } else if (action == UserAction.DownPressed) {
      this._direction = SpriteDirection.Down;
    } else if (action == UserAction.ActionPressed) {
      const index =
        (this._spriteController.selectedSpriteIndex + 1) %
        this._spriteController.spriteCount;

      this._spriteController.setSprite(index);

      console.debug('Showing ' + this._spriteController.selectedSpriteId);
    }

    return true;
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this.walkAnimation(dt, this._direction);
  }

  walkAnimation(dt: number, direction: SpriteDirection) {
    let sprites = ['ness.down.step.left', 'ness.down.step.right'];
    let flip: boolean = false;
    switch (direction) {
      case SpriteDirection.Right:
        sprites = ['ness.left.stand', 'ness.left.step'];
        flip = true;
        break;
      case SpriteDirection.Left:
        sprites = ['ness.left.stand', 'ness.left.step'];
        break;
    }

    // toggle and animation
    if (this._animationState == 0) {
      this._spriteController.setFlip(flip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(sprites[0], true);
    } else if (this._animationState == 1) {
      this._spriteController.setFlip(flip ? SpriteFlip.XFlip : SpriteFlip.None);
      this._spriteController.setSprite(sprites[1], true);
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
