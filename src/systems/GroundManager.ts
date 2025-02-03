import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

import { SpritBatchController } from '../graphics/SpriteBatchController';
import { ILevelData } from '../environment/ILevelData';
import { TileComponent } from '../components/TileComponent';
import { TileFactory } from './TileFactory';
import { LevelGenerator } from '../environment/LevelGenerator';
import { LevelConstructionParams } from '../environment/LevelConstructionParams';
import vec2 from '../math/vec2';
import { TouchSurfaceEvent } from '../components/TouchSurfaceEvent';
import { TileContext } from '../components/TileContext';
import { LevelLoader } from '../environment/LevelLoader';
import vec3 from '../math/vec3';

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

  /** Used to load levels from json */
  protected _levelLoader: LevelLoader;

  constructor(eng: Engine) {
    super(eng);

    this._spriteController = new SpritBatchController(eng);
  }

  /**
   * Initialize a level
   * @param levelData
   */
  async initialize() {
    // reset tiles that need updates
    this._updateTiles = [];

    const texture = this.eng.assetManager.tile.texture;
    const data = this.eng.assetManager.tile.data;
    this._spriteController.initialize(texture, data);

    this._tileFactory = new TileFactory(this.eng, this._spriteController);
    this._levelLoader = new LevelLoader(this.eng);
  }

  loadLevel(levelData: ILevelData): void {
    this._levelData = levelData;

    // reset tiles that need updates
    this._updateTiles = [];

    const texture = this.eng.assetManager.tile.texture;
    const data = this.eng.assetManager.tile.data;
    this._spriteController = new SpritBatchController(this.eng);
    this._spriteController.initialize(texture, data);
    this._tileFactory = new TileFactory(this.eng, this._spriteController);

    // allocate tiles first
    this._tiles = [[[]]];
    for (let k = 0; k < levelData.encode.length; k++) {
      this._tiles.push([]);

      for (let j = 0; j < levelData.encode[k].length; j++) {
        this._tiles[k].push([]);
        const row = levelData.encode[k][j];

        for (let s = 0; s < row.length; s += 2) {
          this._tiles[k][j].push(this._tileFactory.empty);
        }
      }
    }

    // then load the level
    this._levelLoader.load(this._levelData, this._tileFactory, this._tiles);
  }

  /**
   * Register a tile for update
   * @param tile
   */
  registerForUpdate(tile: TileComponent) {
    this._updateTiles.push(tile);
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
   * Gets the highest tile starting from a height of K
   * @param k
   */
  getHighestTileFrom(i: number, j: number, k: number): number {
    const tileX = Math.floor(i);
    const tileY = Math.floor(j);
    let tileZ = Math.floor(k);
    let tile = this.getTile(tileX, tileY, tileZ);

    if (tile.empty) {
      for (; tileZ > 0; tileZ--) {
        tile = this.getTile(tileX, tileY, tileZ);
        if (!tile.empty) {
          return tile.tileHeight;
        }
      }
    }
  }

  /**
   * This function will place a source tile onto the tile located at i,j.
   * It will search up and down to find a non empty tile.
   * @param source
   * @param i
   * @param j
   */
  placeTileOn(source: TileComponent, i: number, j: number): void {
    const tileX = Math.floor(source.tilePosition.x);
    const tileY = Math.floor(source.tilePosition.y);
    const tileZ = Math.floor(source.tilePosition.z);

    const fractionI = source.tilePosition.x % 1;
    const fractionJ = source.tilePosition.y % 1;
    const dir = new vec3([i, j, 0]);

    // left
    if (dir.x < 0 && fractionI < 0.25) {
      // cancel x movement
      if (!this.canAccessTile(source, tileX - 1, tileY, tileZ)) {
        dir.x = 0;
      }
    }

    // right
    else if (dir.x > 0 && fractionI > 0.75) {
      // cancel x movement
      if (!this.canAccessTile(source, tileX + 1, tileY, tileZ)) {
        dir.x = 0;
      }
    }

    // up
    if (dir.y < 0 && fractionJ < 0.25) {
      // cancel y movement
      if (!this.canAccessTile(source, tileX, tileY - 1, tileZ)) {
        dir.y = 0;
      }
    }
    // down
    else if (dir.y > 0 && fractionJ > 0.75) {
      // cancel y movement
      if (!this.canAccessTile(source, tileX, tileY + 1, tileZ)) {
        dir.y = 0;
      }
    }

    // check corners
    if (dir.x > 0 && dir.y > 0 && fractionJ > 0.75 && fractionI > 0.75) {
      //top right
      if (!this.canAccessTile(source, tileX + 1, tileY + 1, tileZ)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y > 0 && fractionJ < 0.25 && fractionI > 0.75) {
      //top left
      if (!this.canAccessTile(source, tileX - 1, tileY + 1, tileZ)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y < 0 && fractionJ < 0.25 && fractionI < 0.25) {
      //bottom left
      if (!this.canAccessTile(source, tileX - 1, tileY - 1, tileZ)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y > 0 && fractionJ < 0.25 && fractionI > 0.75) {
      //bottom right
      if (!this.canAccessTile(source, tileX - 1, tileY + 1, tileZ)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    }

    // check if the player can access this tile
    if (dir.length() > 0) {
      source.moveToTilePosition(
        source.tilePosition.x + dir.x,
        source.tilePosition.y + dir.y,
        source.tilePosition.z + dir.z,
        dir
      );
    }
  }

  /**
   * Get the tile at this location. If there is none just return empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  getTile(i: number, j: number, k: number) {
    const tileX = Math.floor(i);
    const tileY = Math.floor(j);
    const tileZ = Math.floor(k);

    let tile: TileComponent = this._tileFactory.empty;

    if (this._tiles[tileZ] != undefined && this._tiles[tileZ][tileY] != undefined) {
      tile = this._tiles[tileZ][tileY][tileX] ?? this._tileFactory.empty;
    }

    return tile;
  }

  /**
   * Search down then up at the current location for a tile that is not empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  findTile(i: number, j: number, k: number) {
    let tileZ = Math.floor(k);
    const maxTileAbove = Math.floor(k) + 3;

    let tile: TileComponent = this.getTile(i, j, k);

    // if empty look down then up
    if (tile.empty) {
      // first go down to the bottom.
      for (tileZ--; tileZ >= 0; tileZ--) {
        tile = this.getTile(i, j, tileZ);
        if (!tile.empty) {
          return tile;
        }
      }

      // now go up
      for (tileZ = Math.floor(k); tileZ < maxTileAbove; tileZ++) {
        tile = this.getTile(i, j, tileZ);
        if (!tile.empty) {
          return tile;
        }
      }
    }

    return tile;
  }

  /**
   * Makes a tile empty
   * @param tileComponent
   */
  removeTile(tileComponent: TileComponent): void {
    const i = tileComponent.tileIndex.x;
    const j = tileComponent.tileIndex.y;
    const k = tileComponent.tileIndex.z;
    if (this._tiles[i] != undefined && this._tiles[i][j] != undefined) {
      this._tiles[i][j][k] = this._tileFactory.empty;
    }
  }

  /**
   * Moves a tile to a new location
   * @param tileComponent
   * @param i
   * @param j
   * @param k
   */
  moveTile(tileComponent: TileComponent, i: number, j: number, k: number): void {
    const last = tileComponent.tileIndex;

    // did the tile index change
    if (k != last.z || j != last.y || i != last.x) {
      this._tiles[last.z][last.y][last.x] = this._tileFactory.empty;
      this._tiles[k][j][i] = tileComponent;
    }
  }

  /**
   * Perform hit test
   * @param touchPoint
   */
  hitTest(e: TouchSurfaceEvent) {
    console.debug('touch event ' + e.touchPoint);
    //TODO do hit test on the tiles
  }

  /**
   * Can the player access this tile
   * @param x screen space
   * @param y screen space
   * @param z screen space
   * @returns true if the player can access this cell
   */
  canAccessTile(tileComponent: TileComponent, i: number, j: number, k: number): boolean {
    let tile = this.findTile(i, j, k);

    // there is nothing under us
    if (tile.empty) {
      return false;
    }

    // try and access this tile
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
  onEnter(tileComponent: TileComponent, i: number, j: number, k: number, tileContext: TileContext): void {
    let tile = this.getTile(i, j, k);
    tile.onEnter(tileComponent, tileContext);
  }

  /**
   * Fired when a tile exits a cell
   * @param x
   * @param y
   * @param z
   */
  onExit(tileComponent: TileComponent, i: number, j: number, k: number, tileContext: TileContext): void {
    let tile = this.getTile(i, j, k);
    return tile.onExit(tileComponent, tileContext);
  }

  /**
   * Update the sprite controller and actions
   * @param dt
   */
  update(dt: number): void {
    this._spriteController.update(dt);
    if (!this.eng.pause) {
      for (const tile of this._updateTiles) {
        tile.update(dt);
      }
    }
  }

  closeLevel(): void {
    this._updateTiles = [];

    // clean up old tiles
    for (let k = 0; k < this._tiles.length; k++) {
      for (let j = 0; j < this._tiles[k].length; j++) {
        for (let i = 0; i < this._tiles[k][j].length; i++) {
          this._tiles[k][j][i]?.dispose();
        }
      }
    }

    this._spriteController.dispose();

    this._tiles = [[[]]];
  }
}
