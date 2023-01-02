import { Texture } from '../core/Texture';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import TileImg from '../assets/IsometricTile.png';
import TileData from '../assets/IsometricTile.json';
import { SpritBatchController } from './SpriteBatchController';
import vec2 from '../math/vec2';
import mat2 from '../math/mat2';
import mat4 from '../math/mat4';
import { ILevelData } from './ILevelData';

export class Ground extends Component {
  protected _spriteController: SpritBatchController;
  protected _levelData: ILevelData;

  constructor(eng: Engine, levelData: ILevelData) {
    super(eng);
    this._levelData = levelData;
    this._spriteController = new SpritBatchController(eng);
  }

  async initialize() {
    const texture = new Texture(this.gl);
    await texture.loadImage(TileImg);
    this._spriteController.initialize(texture, TileData);
    this.buildLevel();
    /*
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

        if ((i == 2 && j == 3) || j == 29) {
          this.highlight(i, j);
        }
        this._spriteController.setSpritePosition(x, y, z);
      }
    }
    this._spriteController.commitToBuffer();
    */
  }

  cellToWorldCoord(
    i: number,
    j: number,
    height: number
  ): { x: number; y: number; z: number } {
    const scale = 2;
    const w = 32;
    const h = 16;

    let world = { x: 0, y: 0, z: 0 };

    const xOffset = j % 2 == 0 ? 0 : w * 0.25 * scale;
    const x = i * w + xOffset;
    const y = this.eng.height - h - j * h * 0.25;
    const z = (y / this.eng.height) * 2 - 1;

    return world;
  }

  buildLevel() {
    const tileTransform = new mat2([]);

    const scale = 2;

    for (let i = 0; i < this._levelData.cells.length; i++) {
      // draw the rows first
      for (let j = 0; j < this._levelData.cells[i].length; j++) {
        const cellId = this._levelData.ids[this._levelData.cells[i][j]];

        this._spriteController.activeSprite('tile' + i + '_' + j);
        let spriteId = 'empty';
        if (cellId.includes('ground')) {
          spriteId = 'block';
        } else if (cellId.includes('highlight')) {
          spriteId = 'block.half.highlight';
        } else if (cellId.includes('tree')) {
          spriteId = 'tree';
        } else if (cellId.includes('slop')) {
          spriteId = 'slop.right';
        }

        this._spriteController.setSprite(spriteId);
        this._spriteController.scale(scale);

        // the width and the height are hard coded because the grid is
        // 32 x 16
        const cellSize = 32 * scale;
        const halfWidth = this.eng.width * 0.5;
        const heightOffset = this.eng.height - cellSize;

        let k = 0;
        if (i == 1 && j == 4) {
          k = 1;
        }

        const x = halfWidth - j * cellSize * 0.5 + i * cellSize * 0.5;
        const y =
          heightOffset -
          j * cellSize * 0.25 -
          i * cellSize * 0.25 +
          k * cellSize * 0.5;

        // calculate the top and bottom depth values of the quad.
        // event though the cells are drawn as diamonds they are really quads
        // for depth calculations the top and bottom verts of the quad need to
        // be calculated
        const yRemoveHeight = y - k * cellSize;
        const depthStepDown = cellSize;

        const zLower =
          ((yRemoveHeight - depthStepDown) / this.eng.height) * 2 - 1;
        const zUpper = (yRemoveHeight / this.eng.height) * 2 - 1;

        this._spriteController.setSpritePosition(x, y, zLower, zUpper);
      }
    }
    this._spriteController.commitToBuffer();
  }

  highlight(i: number, j: number) {
    const id = 'tile' + i + '_' + j;
    this._spriteController.activeSprite(id);
    this._spriteController.setSprite('block.half.highlight');
  }

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
