import { Texture } from '../graphics/Texture';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import TileImg from '../assets/IsometricTile.png';
import TileData from '../assets/IsometricTile.json';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { ILevelData } from '../environment/ILevelData';
import { TileComponent } from '../components/TileComponent';
import vec2 from '../math/vec2';
import { TileFactory } from './TileFactory';

/**
 * The ground class is the cell environment the player interacts with. Cells are block that
 * that different tile components interact with. Think of it as the world tile components live in.
 * This class is driven by Tile image data and LevelData.
 */
export class GroundManager extends Component {
  /** Used to render all the tiles */
  protected _spriteController: SpritBatchController;
  /** model data for the level */
  protected _levelData: ILevelData;
  /** tile components created from the model data */
  protected _tiles: TileComponent[][][];
  /** used to crate the tiles from the model data */
  protected _tileFactory: TileFactory;
  /** tiles that require an update */
  protected _updateTiles: TileComponent[];

  constructor(eng: Engine, levelData: ILevelData) {
    super(eng);
    this._levelData = levelData;

    this._spriteController = new SpritBatchController(eng);
    this._tileFactory = new TileFactory(eng, this._spriteController);
  }

  async initialize() {
    const texture = new Texture(this.gl);
    await texture.loadImage(TileImg);
    this._spriteController.initialize(texture, TileData);
    console.debug('sprite list: ', this._spriteController.getSpriteList());

    this.buildLevel();
  }

  /**
   * build the level from the level data
   */
  buildLevel() {
    this._tiles = [];
    this._updateTiles = [];

    // k is the height layer of the level
    for (let k = 0; k < this._levelData.cells.length; k++) {
      // j is the columns that run from top right to bottom left

      this._tiles.push([]);
      for (let j = 0; j < this._levelData.cells[k].length; j++) {
        // i is the rows that run from top left to bottom right
        this._tiles[k].push([]);
        for (let i = 0; i < this._levelData.cells[k][j].length; i++) {
          // get the type and sprite id
          const tileTypeAndSprite = this.getCellTypeAndSprite(i, j, k);

          const newTile = this._tileFactory.createStaticTile(
            tileTypeAndSprite,
            i,
            j,
            k
          );
          // add the new tile
          this._tiles[k][j].push(newTile);

          if (newTile.requiresUpdate) {
            this._updateTiles.push(newTile);
          }
        }
      }
    }

    // commit all the sprites to the buffer to be drawn
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
    return this.getTile(i, j, k).type == 'empty';
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
   * Get the tile at this location. If there is none just return empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  getTile(i: number, j: number, k: number) {
    let tile: TileComponent = this._tileFactory.empty;

    if (this._tiles[k] != undefined && this._tiles[k][j] != undefined) {
      tile = this._tiles[k][j][i] ?? this._tileFactory.empty;
    }
    return tile;
  }

  /**
   * Get the cell type. x y and z are int cells values
   * @param i
   * @param j
   * @param k
   */
  getCellTypeAndSprite(i: number, j: number, k: number): string {
    let type = 'empty';
    try {
      // subtract 10 because all the cell indices are offset by 10
      const typeIndex = this._levelData.cells[k][j][i] - 10 ?? 0;
      type = this._levelData.typesAndSprites[typeIndex] ?? 'empty';

      // this is used as a separator between groups of 10 tile types.
      // it's there to make the json easier to read. It also means empty.
      if (type == '---') {
        type = 'empty';
      }
    } catch (e) {
      //NOP we will just return empty
    }
    return type;
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
    let tile = this.getTile(i, j, k);
    return tile.canAccessTile(tileComponent);
  }

  /**
   * When a tile access another tile
   * @param tileComponent
   * @param i
   * @param j
   * @param k
   * @returns
   */
  onEnter(tileComponent: TileComponent, i: number, j: number, k: number) {
    let tile = this.getTile(i, j, k);
    return tile.onEnter(tileComponent);
  }

  /**
   * Fired when a tile exits a cell
   * @param x
   * @param y
   * @param z
   */
  onExit(tileComponent: TileComponent, i: number, j: number, k: number) {
    let tile = this.getTile(i, j, k);
    return tile.onExit(tileComponent);
  }

  /**
   * Update the sprite controller and actions
   * @param dt
   */
  update(dt: number) {
    this._spriteController.update(dt);
    for (const tile of this._updateTiles) {
      tile.update(dt);
    }
  }
}
