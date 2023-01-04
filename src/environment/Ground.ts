import { Texture } from '../core/Texture';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import TileImg from '../assets/IsometricTile.png';
import TileData from '../assets/IsometricTile.json';
import { SpritBatchController } from './SpriteBatchController';
import mat2 from '../math/mat2';
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
  }

  buildLevel() {
    const tileTransform = new mat2([]);

    const scale = 2;
    // loop over each height layer
    for (let k = 0; k < this._levelData.cells.length; k++) {
      // i is the columns that run from top right to bottom left
      for (let i = 0; i < this._levelData.cells[k].length; i++) {
        // j is the rows that run from top left to bottom right
        for (let j = 0; j < this._levelData.cells[k][i].length; j++) {
          const cellId = this._levelData.ids[this._levelData.cells[k][i][j]];

          this._spriteController.activeSprite('tile_' + k + '_' + i + '_' + j);
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
          // 32 x 32
          const cellSize = 32 * scale;
          const halfWidth = this.eng.width * 0.5;
          const heightOffset = this.eng.height - cellSize * 0.25;

          const x = -j * cellSize * 0.5 + i * cellSize * 0.5 + halfWidth;
          const y =
            -j * cellSize * 0.25 -
            i * cellSize * 0.25 +
            k * cellSize * 0.5 +
            heightOffset;

          // calculate the top and bottom depth values of the quad.
          // event though the cells are drawn as diamonds they are really quads
          // for depth calculations the top and bottom verts of the quad need to
          // be calculated
          const yRemoveHeight = y - k * cellSize;
          const zLower = (yRemoveHeight / this.eng.height) * 2 - 1;
          const zUpper = (yRemoveHeight / this.eng.height) * 2 - 1;

          if (i == 0 && j == 0) {
            console.debug(' cell[0,0] = ' + x + ', ' + y + ', ' + zLower);
          }

          this._spriteController.setSpritePosition(x, y, zLower, zUpper);
        }
      }
    }
    this._spriteController.commitToBuffer();
  }

  collisionDetection(x: number, y: number, z: number) {
    const tile = this.eng.tileManger.toTileLoc(x, y, z);
    this._spriteController.activeSprite(
      'tile_' + tile.z + '_' + tile.x + '_' + tile.y
    );
    this._spriteController.setSprite('block.half.highlight', true);
  }

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
