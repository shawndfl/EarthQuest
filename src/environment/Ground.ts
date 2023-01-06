import { Texture } from '../core/Texture';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import TileImg from '../assets/IsometricTile.png';
import TileData from '../assets/IsometricTile.json';
import { SpritBatchController } from './SpriteBatchController';
import mat2 from '../math/mat2';
import { ILevelData } from './ILevelData';

/**
 * The ground class is the cell environment the player interacts with
 */
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
    console.debug(this._spriteController.getSpriteList());
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
          let spriteId = this.getCellType(i, j, k);

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

  /**
   * Get the cell type. x y and z are int cells values
   * @param i
   * @param j
   * @param k
   */
  getCellType(i: number, j: number, k: number): string {
    let type = 'empty';
    try {
      const typeIndex = this._levelData.cells[k][i][j];
      type = this._levelData.ids[typeIndex];
    } catch (e) {
      console.warn('invalid tile ' + k + ', ' + i + ',' + j);
    }
    return type;
  }

  /**
   * Sets a cell type
   * @param type The type of the cell
   * @param i
   * @param j
   * @param k
   */
  setCellType(type: string, i: number, j: number, k: number): boolean {
    let index = 0;
    const found = this._levelData.ids.find((t, i) => {
      if (t == type) {
        index = i;
        return true;
      } else {
        return false;
      }
    });

    if (found) {
      try {
        this._levelData.cells[k][i][j] = index;
        this._spriteController.activeSprite('tile_' + k + '_' + i + '_' + j);
        this._spriteController.setSprite(found, true);
      } catch (e) {
        console.warn('invalid tile ' + k + ', ' + i + ',' + j);
      }
    } else {
      console.warn('cannot find cell type: ' + type);
    }
    return true;
  }

  /**
   * Can the player access this tile
   * @param x screen space
   * @param y screen space
   * @param z screen space
   * @returns true if the player can access this cell
   */
  canAccessTile(x: number, y: number, z: number): boolean {
    const tile = this.eng.tileManger.toTileLoc(x, y, z);

    let type = this.getCellType(tile.i, tile.j, tile.k);

    if (type != 'tree' && type != 'empty') {
      return true;
    } else {
      return false;
    }
  }

  /**
   * When the player enters a cell
   * @param x screen space
   * @param y screen space
   * @param z screen space
   */
  onEnter(x: number, y: number, z: number) {
    const tile = this.eng.tileManger.toTileLoc(x, y, z);
    this.setCellType('block.highlight', tile.i, tile.j, tile.k);
  }

  /**
   * Fired when a player exits a cell
   * @param x
   * @param y
   * @param z
   */
  onExit(x: number, y: number, z: number) {
    const tile = this.eng.tileManger.toTileLoc(x, y, z);
    const type = this.getCellType(tile.i, tile.j, tile.k);
    if (type == 'block.highlight') {
      this.setCellType('block', tile.i, tile.j, tile.k);
    }
  }

  /**
   * Update the sprite controller and actions
   * @param dt
   */
  update(dt: number) {
    this._spriteController.update(dt);
  }
}
