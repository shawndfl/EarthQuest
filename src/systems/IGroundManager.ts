import { Component } from '../components/Component';
import { ILevelData } from '../environment/ILevelData';
import { TileComponent } from '../components/TileComponent';
import { TouchSurfaceEvent } from '../components/TouchSurfaceEvent';
import { TileContext } from '../components/TileContext';
import { PlayerController } from '../components/PlayerController';

/**
 * The ground class is the cell environment the player interacts with. Cells are block that
 * that different tile components interact with. Think of it as the world tile components live in.
 * This class is driven by Tile image data and LevelData.
 */
export interface IGroundManager extends Component {
  get worldPlayer(): PlayerController;

  /**
   * Initialize a level
   * @param levelData
   */
  initialize(): Promise<void>;

  /**
   * Load all the tiles
   * @param level
   */
  loadLevel(level: ILevelData): Promise<void>;

  loadBattle(level: ILevelData): Promise<void>;

  /**
   * Register a tile for update
   * @param tile
   */
  registerForUpdate(tile: TileComponent): void;

  /**
   * Returns true if the cell is empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  isEmpty(i: number, j: number, k: number): boolean;

  /**
   * Gets the highest tile starting from a height of K
   * @param k
   */
  getHighestTileFrom(i: number, j: number, k: number): number;

  /**
   * This function will place a source tile onto the tile located at i,j.
   * It will search up and down to find a non empty tile.
   * @param source
   * @param i
   * @param j
   */
  placeTileOn(source: TileComponent, i: number, j: number): void;

  /**
   * Get the tile at this location. If there is none just return empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  getTile(i: number, j: number, k: number): TileComponent;

  /**
   * finds a tile
   * @param search
   */
  findTile(predicate: (tile: TileComponent, i: number, j: number, k: number) => boolean): TileComponent[];

  /**
   * Search down then up at the current location for a tile that is not empty
   * @param i
   * @param j
   * @param k
   * @returns
   */
  findTileSolid(i: number, j: number, k: number): TileComponent;

  /**
   * Makes a tile empty
   * @param tileComponent
   */
  removeTile(tileComponent: TileComponent): void;

  /**
   * Moves a tile to a new location
   * @param tileComponent
   * @param i
   * @param j
   * @param k
   */
  moveTile(tileComponent: TileComponent, i: number, j: number, k: number): void;
  /**
   * Perform hit test
   * @param touchPoint
   */
  hitTest(e: TouchSurfaceEvent): void;

  /**
   * Can the player access this tile
   * @param x screen space
   * @param y screen space
   * @param z screen space
   * @returns true if the player can access this cell
   */
  canAccessTile(tileComponent: TileComponent, i: number, j: number, k: number): boolean;

  /**
   * When a tile access another tile
   * @param tileComponent
   * @param i
   * @param j
   * @param k
   * @returns
   */
  onEnter(tileComponent: TileComponent, i: number, j: number, k: number, tileContext: TileContext): void;

  /**
   * Fired when a tile exits a cell
   * @param x
   * @param y
   * @param z
   */
  onExit(tileComponent: TileComponent, i: number, j: number, k: number, tileContext: TileContext): void;

  /**
   * Update the sprite controller and actions
   * @param dt
   */
  update(dt: number): void;

  closeLevel(): void;
}
