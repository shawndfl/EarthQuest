import { Engine } from '../core/Engine';
import { ISpriteData } from '../core/ISpriteData';
import { SpriteFlip } from '../core/Sprite';
import { Texture } from '../core/Texture';
import { UserAction } from '../core/UserAction';
import { PlayerController } from './PlayerController';

/**
 * Controls the player sprite.
 */
export class SpriteDebugger extends PlayerController {
  constructor(eng: Engine) {
    super(eng);
  }

  initialize(spriteSheet: Texture, characterData: ISpriteData[]) {
    super.initialize(spriteSheet, characterData);

    this._spriteController.setSpritePosition(10, 300, 0);
    this._spriteController.setSprite('ness.left.stand');
    this._spriteController.commitToBuffer();
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(action: UserAction): boolean {
    if (action == UserAction.LeftPressed) {
      let index = this._spriteController.selectedSpriteIndex - 1;
      if (index < 0) {
        index = this._spriteController.spriteCount - 1;
      }

      this._spriteController.setSprite(index, true);

      console.debug('Showing ' + this._spriteController.selectedSpriteId);
      //this._direction = SpriteDirection.Left;
    } else if (action == UserAction.RightPressed) {
      let index = this._spriteController.selectedSpriteIndex + 1;
      if (index >= this._spriteController.spriteCount) {
        index = 0;
      }

      this._spriteController.setSprite(index, true);

      console.debug('Showing ' + this._spriteController.selectedSpriteId);
      //this._direction = SpriteDirection.Right;
    } else if (action == UserAction.UpPressed) {
    } else if (action == UserAction.DownPressed) {
    } else if (action == UserAction.ActionPressed) {
    }

    return false;
  }

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
