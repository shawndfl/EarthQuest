import { Texture } from '../core/Texture';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import TileImg from '../assets/IsometricTile.png';
import TileData from '../assets/IsometricTile.json';
import { SpritBatchController } from './SpriteBatchController';
import mat2 from '../math/mat2';
import { ILevelData } from './ILevelData';
import { TileComponent } from '../components/TileComponent';
import vec2 from '../math/vec2';

/**
 * The ground class is the cell environment the player interacts with. Cells are block that
 * that different tile components interact with. Think of it as the world tile components live in.
 * This class is driven by Tile image data and LevelData.
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

  /**
   * build the level from the level data
   */
  buildLevel() {
    const scale = 2;
    // loop over each height layer
    for (let k = 0; k < this._levelData.cells.length; k++) {
      // i is the columns that run from top right to bottom left
      for (let i = 0; i < this._levelData.cells[k].length; i++) {
        // j is the rows that run from top left to bottom right
        for (let j = 0; j < this._levelData.cells[k][i].length; j++) {
          const cellId = this._levelData.ids[this._levelData.cells[k][i][j]];

          this._spriteController.activeSprite('tile_' + i + '_' + j + '_' + k);
          let spriteId = this.getCellType(i, j, k);

          this._spriteController.setSprite(spriteId);
          this._spriteController.scale(scale);

          const screen = this.eng.tileManger.toScreenLoc(i, j, k);

          this._spriteController.setSpritePosition(
            screen.x,
            screen.y,
            screen.z,
            screen.z
          );
        }
      }
    }
    this._spriteController.commitToBuffer();
  }

  /**
   * Returns true if the cell is empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  isEmpty(i: number, j: number, k: number): boolean {
    try {
      let typeIndex = this._levelData.cells[k][i][j] ?? 0;
      return typeIndex == 0;
    } catch (e) {
      //NOP
    }
    return true;
  }

  /**
   * Gets the cells height by searching up and down until a tile is found
   * @param i
   * @param j
   * @param k
   * @returns
   */
  getCellHeight(i: number, j: number, k: number) {
    let height = k;
    try {
      // if it is empty search down to zero
      if (this.isEmpty(i, j, k) && k > 0) {
        while (this.isEmpty(i, j, --k) && k > 0) {
          height = k;
        }
      } else {
        // else search up
        while (!this.isEmpty(i, j, ++k)) {
          height = k;
        }
      }
    } catch (e) {
      //NOP
    }
    return height;
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
      const typeIndex = this._levelData.cells[k][i][j] ?? 0;
      type = this._levelData.ids[typeIndex] ?? 'empty';
    } catch (e) {
      console.warn('invalid tile ' + i + ', ' + j + ',' + k);
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
        this._spriteController.activeSprite('tile_' + i + '_' + j + '_' + k);
        this._spriteController.setSprite(found, true);
      } catch (e) {
        console.warn('invalid tile ' + i + '_' + j + '_' + k);
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
  canAccessTile(
    tileComponent: TileComponent,
    i: number,
    j: number,
    k: number
  ): boolean {
    let type = this.getCellType(i, j, k);
    const height = this.getCellHeight(i, j, k);

    // reset slop vector
    this.eng.scene.player.slopVector = new vec2([0, 0]);

    let AboveType = this.getCellType(i, j, k + 1);
    if (AboveType == 'slop.left') {
      console.debug(
        'hit slop tile index: ' +
          tileComponent.tileIndex.toString() +
          ' tileComponent '
      );
      if (
        tileComponent.tileIndex.x == i &&
        tileComponent.tileIndex.y == j + 1
      ) {
        console.debug('facing sloping vector');
        this.eng.scene.player.slopVector = new vec2([0, 0.1]);
      }
    }

    // check tile height.
    if (tileComponent.tileHeightIndex != height) {
      return false;
    }

    // check for collision
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
  onEnter(tileComponent: TileComponent, i: number, j: number, k: number) {
    let type = this.getCellType(i, j, k);

    if (!type.includes('slop')) {
      this.setCellType('block.highlight', i, j, k);
    } else {
      console.debug('tile error ' + i + ', ' + j + ', ' + k);
    }
  }

  /**
   * Fired when a player exits a cell
   * @param x
   * @param y
   * @param z
   */
  onExit(tileComponent: TileComponent, i: number, j: number, k: number) {
    const type = this.getCellType(i, j, k);
    if (type == 'block.highlight') {
      this.setCellType('block', i, j, k);
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
