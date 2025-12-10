import { Component } from '../core/Component';
import { CollisionResults } from '../data/CollisionResults';
import { CollisionTypes } from '../data/CollisionTypes';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DrawingLayer } from '../drawingLayers/DrawingLayer';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import rect from '../math/rect';
import { MenuTile } from '../tiles/MenuTile';
import { NpcTile } from '../tiles/NpcTile';
import { PlayerTile } from '../tiles/PlayerTile';
import { SolidTile } from '../tiles/SolidTile';
import { TileController } from '../tiles/TileController';
import { TreeTile } from '../tiles/TreeTiles';

/**
 * Create two layers of tiles.
 * 800x600 visible tiles. Allow for overflow on all sides
 */
export class TileManager extends Component {
  private _tileControllers: Map<string, TileController>;
  private _playerTile: PlayerTile;

  public get playerTile(): PlayerTile {
    return this._playerTile;
  }

  public get tileControllers(): Map<string, TileController> {
    return this._tileControllers;
  }
  /**
   * Create the tiles
   */
  async initialize(): Promise<void> {
    this._tileControllers = new Map();
  }

  closeLevel(): void {
    // reset the tile controllers
    for (let [, controller] of this._tileControllers) {
      controller.closeLevel();
    }
    this._tileControllers.clear();
  }

  async loadLevel(): Promise<void> {
    /*
    const level = this.eng.gameManager.levelData.data;
    console.debug('TileManager loading level...');

    // reset the tile controllers
    for (let controller of this._tileControllers) {
      controller.closeLevel();
    }
    this._tileControllers = [];

    // create the drawing layers
    this._drawingLayers = [];
    for (let i = 0; i < level.map.length; i++) {
      const layer = new DrawingLayer(this.eng, i);
      await layer.initialize();
      await layer.loadLevel();
      this._drawingLayers.push(layer);
    }

    console.debug('initializing ' + this._tileControllers.length + ' tiles...');

    // initialize the controllers the layers might have made
    for (let controller of this._tileControllers) {
      controller.initialize();
    }
    */
  }

  panningViewPort(): void {}

  update(dt: number): void {
    for (let [, controller] of this._tileControllers) {
      controller.update(dt);
    }
    this.panningViewPort();
  }

  /**
   * register player tile
   * @param player
   */
  registerPlayerTile(player: PlayerTile): void {
    this._playerTile = player;
  }

  /**
   * Register a tile controller
   * @param tileController
   */
  registerTileForUpdate(tileController: TileController): void {
    this._tileControllers.set(tileController.uuid, tileController);
  }

  /**
   * Remove the controller from update
   * @param uuid
   */
  removeTileFromUpdate(uuid: string): void {
    this._tileControllers.delete(uuid);
  }
}
