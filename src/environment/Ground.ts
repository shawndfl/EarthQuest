import { Texture } from '../core/Texture';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import TileImg from '../assets/IsometricTile.png';
import TileData from '../assets/IsometricTile.json';
import { SpritBatchController } from './SpriteBatchController';
import vec2 from '../math/vec2';
import mat2 from '../math/mat2';
import mat4 from '../math/mat4';

export class Ground extends Component {
  protected _spriteController: SpritBatchController;

  constructor(eng: Engine) {
    super(eng);
    this._spriteController = new SpritBatchController(eng);
  }

  async initialize() {
    const texture = new Texture(this.gl);
    await texture.loadImage(TileImg);
    this._spriteController.initialize(texture, TileData);

    const scale = 2;
    const start = new vec2([10, 10]);

    const tileTransform = new mat2([]);
    for (let j = 0; j < 30; j++) {
      for (let i = 0; i < 10; i++) {
        this._spriteController.activeSprite('tile' + i + '_' + j);
        this._spriteController.setSprite('block');
        this._spriteController.scale(scale);

        // get width and height after the sprite is set and scaled
        const w = this._spriteController.sprite.getSpriteWidth();
        const h = this._spriteController.sprite.getSpriteHeight();

        const xOffset = j % 2 == 0 ? 0 : w * 0.25 * scale;

        //const x = start.x + i * 16 * scale + xOffset;
        //const y = start.y + j * 4 * scale;
        //const z = -((y / this.eng.height) * 2 - 1);

        const x = start.x + i * w + xOffset;
        const y = this.eng.height - h - (start.y + j * h * 0.25);
        const z = -50; //-((y / this.eng.height) * 2 - 1);
        if (i == 0) {
          console.debug('ground depth: ' + z + ' i: ' + i);
        }
        this._spriteController.setSpritePosition(x, y, z);
      }
    }
    this._spriteController.commitToBuffer();
  }

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
