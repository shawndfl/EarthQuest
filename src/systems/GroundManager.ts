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
import { TileAccessOptions } from '../components/TileAccessOptions';
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

  /** used to generate the levels */
  protected _levelGenerator: LevelGenerator;

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
    this._levelGenerator = new LevelGenerator(this.eng, this._tileFactory);
    this._levelLoader = new LevelLoader(this.eng);

    // create the initial level
    if (false) {
      this.buildLevel({ seed: 605, width: 60, length: 60, height: 7, playerPos: new vec2([9, 6]) });
    }
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
   * Build an auto generated level
   * @param params
   */
  buildLevel(params: LevelConstructionParams) {
    this._tiles = this._levelGenerator.Generate(params);
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
   *
   * @param tileComponent
   * @param moveDirection
   */
  raisePlayerAction(tileComponent: TileComponent) {
    const i = tileComponent.tileIndex.x;
    const j = tileComponent.tileIndex.y;
    const k = tileComponent.tileIndex.z;

    // Check all tiles around this tile component
    this.getTile(i - 1, j + 1, k).onPlayerAction(tileComponent);
    this.getTile(i + 0, j + 1, k).onPlayerAction(tileComponent);
    this.getTile(i + 1, j + 1, k).onPlayerAction(tileComponent);
    this.getTile(i + 1, j + 0, k).onPlayerAction(tileComponent);
    this.getTile(i + 1, j - 1, k).onPlayerAction(tileComponent);
    this.getTile(i + 0, j - 1, k).onPlayerAction(tileComponent);
    this.getTile(i - 1, j - 1, k).onPlayerAction(tileComponent);
    this.getTile(i - 1, j + 0, k).onPlayerAction(tileComponent);
  }

  /**
    * Moves the tile by a given amount
    * @param i
    * @param j
    * @param k
    */
  offsetTile(target: TileComponent, i: number, j: number, k: number): void {
    const tileX = Math.floor(target.tilePosition.x);
    const tileY = Math.floor(target.tilePosition.y);
    const tileZ = Math.floor(target.tilePosition.z);
    const floorHeight = tileZ - 1;

    const fractionI = target.tilePosition.x % 1;
    const fractionJ = target.tilePosition.y % 1;
    const dir = new vec3([i, j, k]);

    // check the current floor height and the level above
    for (let height = floorHeight; height < floorHeight + 2; height++) {
      const options: TileAccessOptions = {
        ignoreEmpty: height != floorHeight,
      };

      // left
      if (dir.x < 0 && fractionI < 0.25) {
        // cancel x movement
        if (!this.canAccessTile(target, tileX - 1, tileY, height, options)) {
          dir.x = 0;
        }
      }

      // right
      else if (dir.x > 0 && fractionI > 0.75) {
        // cancel x movement
        if (!this.canAccessTile(target, tileX + 1, tileY, height, options)) {
          dir.x = 0;
        }
      }

      // up
      if (dir.y < 0 && fractionJ < 0.25) {
        // cancel y movement
        if (!this.canAccessTile(target, tileX, tileY - 1, height, options)) {
          dir.y = 0;
        }
      }
      // down
      else if (dir.y > 0 && fractionJ > 0.75) {
        // cancel y movement
        if (!this.canAccessTile(target, tileX, tileY + 1, height, options)) {
          dir.y = 0;
        }
      }

      // check corners
      if (dir.x > 0 && dir.y > 0 && fractionJ > 0.75 && fractionI > 0.75) {
        //top right
        if (!this.canAccessTile(target, tileX + 1, tileY + 1, height, options)) {
          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            dir.y = 0;
          } else {
            dir.x = 0;
          }
        }
      } else if (dir.x < 0 && dir.y > 0 && fractionJ < 0.25 && fractionI > 0.75) {
        //top left
        if (!this.canAccessTile(target, tileX - 1, tileY + 1, height, options)) {
          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            dir.y = 0;
          } else {
            dir.x = 0;
          }
        }
      } else if (dir.x < 0 && dir.y < 0 && fractionJ < 0.25 && fractionI < 0.25) {
        //bottom left
        if (!this.canAccessTile(target, tileX - 1, tileY - 1, height, options)) {
          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            dir.y = 0;
          } else {
            dir.x = 0;
          }
        }
      } else if (dir.x < 0 && dir.y > 0 && fractionJ < 0.25 && fractionI > 0.75) {
        //bottom right
        if (!this.canAccessTile(target, tileX - 1, tileY + 1, height, options)) {
          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            dir.y = 0;
          } else {
            dir.x = 0;
          }
        }
      }
    }
    // check if the player can access this tile
    if (dir.length() > 0) {
      target.moveToTilePosition(
        target.tilePosition.x + dir.x,
        target.tilePosition.y + dir.y,
        target.tilePosition.z + dir.z,
        dir
      );
    }
  }

  /**
   * Gets the cells height by searching up and down until a tile is found
   * @param i
   * @param j
   * @param k
   * @returns
   */
  getHeightAt(i: number, j: number, k: number) {
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

      const tile = this.getTile(i, j, k);
      if (tile) {
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
   * Moves a tile to a new location
   * @param tileComponent 
   * @param i 
   * @param j 
   * @param k 
   */
  moveTile(tileComponent: TileComponent, i: number, j: number, k: number): void {

    const last = tileComponent.tileIndex;

    this._tiles[last.z][last.y][last.x] = this._tileFactory.empty;
    this._tiles[k][j][i] = tileComponent;

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
  canAccessTile(tileComponent: TileComponent, i: number, j: number, k: number, options: TileAccessOptions): boolean {
    let tile = this.getTile(i, j, k);
    return tile.canAccessTile(tileComponent, options);
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
