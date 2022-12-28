import { Engine } from '../core/Engine';
import { ISpriteData } from '../core/ISpriteData';
import { Texture } from '../core/Texture';
import { SpritController } from '../environment/SpriteController';
import { Component } from './Component';

/**
 * Controls the player sprite.
 */
export class PlayerController extends Component {
  private _spriteController: SpritController;
  private _animationState: number;
  private _animationTimer: number;

  constructor(eng: Engine) {
    super(eng);
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
    if (action == UserAction.Left) {
    }
    return true;
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this.walkAnimation(dt);
  }

  walkAnimation(dt: number) {
    if (this._animationState == 0) {
      this._spriteController.setSprite('ness.forward.step.left');
    } else if (this._animationState == 1) {
      this._spriteController.setSprite('ness.forward.step.right');
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
