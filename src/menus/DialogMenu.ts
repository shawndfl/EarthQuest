import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';

/**
 * Test sprite batch vs normal sprites
 */
export class DialogMenu extends Component {
  private _spriteBatch: SpritBatchController;

  constructor(eng: Engine) {
    super(eng);

    this._spriteBatch = new SpritBatchController(eng);
  }

  /**
   * Simulate some menu data
   */
  async initialize() {
    const texture = this.eng.assetManager.menu.texture;
    const data = this.eng.assetManager.menu.data;
    this._spriteBatch.initialize(texture, data);
    let step = 0;

    //TODO add the menu parts to the sprite batch

    //this._spriteBatch.setSprite('sprite_' + i, 0);
    //this._spriteBatch.setSpritePosition('sprite_' + i, x, y, 5, 0.5);

    this._spriteBatch.commitToBuffer();
  }

  /**
   * Renders the sprites or sprite batches
   * @param dt
   */
  update(dt: number) {
    this._spriteBatch.update(dt);
  }
}
