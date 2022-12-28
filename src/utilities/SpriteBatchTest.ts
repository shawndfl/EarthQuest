import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpritController } from '../environment/SpriteController';
import MenuImage from '../assets/menu.png';
import { ISpriteData } from '../core/ISpriteData';
import { UserAction } from '../core/UserAction';
import { Texture } from '../core/Texture';
import { SpritBatchController } from '../environment/SpriteBatchController';

/**
 * Test sprite batch vs normal sprites
 */
export class SpriteBatchTest extends Component {
  private _sprites: SpritController[];
  private _spriteBatch: SpritBatchController;
  private _useSpriteBatch: boolean;

  readonly maxMenus: number;

  constructor(eng: Engine) {
    super(eng);

    this.maxMenus = 200;
    this._sprites = [];
    this._useSpriteBatch = true;
    if (this._useSpriteBatch) {
      this._spriteBatch = new SpritBatchController(eng);
    } else {
      for (let i = 0; i < this.maxMenus; i++) {
        this._sprites.push(new SpritController(this.eng));
      }
    }
  }

  /**
   * Simulate some menu data
   */
  async initialize() {
    const spriteData: ISpriteData[] = [
      {
        id: 'menu.top.right',
        loc: [0, 0, 7, 7],
      },
      {
        id: 'menu.top.left',
        loc: [16, 0, 7, 7],
      },
      {
        id: 'menu.bottom.left',
        loc: [16, 13, 7, 7],
      },
      {
        id: 'menu.bottom.right',
        loc: [0, 13, 7, 7],
      },
      {
        id: 'menu.bottom',
        loc: [8, 13, 7, 7],
      },
      {
        id: 'menu.right',
        loc: [16, 7, 7, 7],
      },
      {
        id: 'menu.left',
        loc: [0, 7, 7, 7],
      },
      {
        id: 'menu.top',
        loc: [8, 0, 7, 7],
      },
      {
        id: 'menu.cursor',
        loc: [27, 6, 12, 9],
      },
    ];
    const texture = new Texture(this.gl);
    await texture.loadImage(MenuImage);

    if (this._useSpriteBatch) {
      this._spriteBatch.initialize(texture, spriteData);
      let step = 0;
      for (let i = 0; i < this.maxMenus; i++) {
        const x = step % 800;
        const y = (step / 800 + 16) * 16;

        step += 32;
        this._spriteBatch.setSprite('sprite_' + i, 0);
        this._spriteBatch.setSpritePosition('sprite_' + i, x, y, 5, 0.5);
      }
      this._spriteBatch.commitBuffer();
    } else {
      let step = 0;
      for (let i = 0; i < this._sprites.length; i++) {
        const x = step % 800;
        const y = (step / 800 + 16) * 16;

        step += 32;
        this._sprites[i].initialize(texture, spriteData);
        this._sprites[i].setSprite(0);
        this._sprites[i].setSpritePosition(x, y, 5, 0.5);
        this._sprites[i].commitToBuffer();
      }
    }
  }

  /**
   * Handles user input. The logic goes through a chain of command.
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(action: UserAction): boolean {
    return false;
  }

  /**
   * Renders the sprites or sprite batches
   * @param dt
   */
  update(dt: number) {
    if (this._useSpriteBatch) {
      this._spriteBatch.update(dt);
    } else {
      for (let i = 0; i < this._sprites.length; i++) {
        this._sprites[i].update(dt);
      }
    }
  }
}
