import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';

export class GameMenuBuilder extends Component {
  protected _spriteController: SpritBatchController;

  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Set the sprite controller
   * @param spriteController
   */
  initialize(spriteController: SpritBatchController) {
    this._spriteController = spriteController;
  }

  show() {
    this._spriteController.activeSprite('gameMenu');
    this._spriteController.scale(0.9);
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSprite('gameMenu');
    this._spriteController.setSpritePosition(0, 0, -0.2);
  }

  hide() {
    this._spriteController.removeSprite('gameMenu');
    this._spriteController.commitToBuffer();
  }
}
