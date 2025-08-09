import { Component } from '../core/Component';
import { CollisionResults } from '../data/CollisionResults';
import { CollisionTypes } from '../data/CollisionTypes';
import { ILevelData, TileData } from '../data/ILevelData';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import rect from '../math/rect';
import { NpcTile } from '../tiles/NpcTile';
import { PlayerTile } from '../tiles/PlayerTile';
import { StaticTile } from '../tiles/StaticTile';
import { TileController } from '../tiles/TileController';
import { TreeTile } from '../tiles/TreeTiles';
import { DrawingLayer } from './DrawingLayer';
import { UserAction } from './InputManager';

/**
 * Create two layers of tiles.
 * 800x600 visible tiles. Allow for overflow on all sides
 */
export class TileManager extends Component {
  private _drawingLayers: DrawingLayer[];
  private _tileControllers: TileController[] = [];

  public get tileControllers(): TileController[] {
    return this._tileControllers;
  }
  /**
   * Create the tiles
   */
  async initialize(): Promise<void> {
    this._drawingLayers = [];
    this._tileControllers = [];
  }

  async loadLevel(): Promise<void> {
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

    // initialize the controllers the layers might have made
    for (let controller of this._tileControllers) {
      controller.initialize();
    }
  }

  panningViewPort(): void {}

  update(dt: number): void {
    for (let controller of this._tileControllers) {
      controller.update(dt);
    }
    this.panningViewPort();

    //Render
    // baseLayer - includes background, and sprites sorted from top to bottom
    // Clear the canvas before we start drawing on it.
    for (let layer of this._drawingLayers) {
      layer.update(dt);
    }
  }

  /**
   * Registers a quad by wrapping it in a controller and saving it in the list
   * @param tileData
   * @param quad
   * @param sourceTexture
   * @param buffer
   * @returns
   */
  registerQuad(
    tileData: RuntimeTileData,
    quad: Quad,
    sourceTexture: Texture,
    buffer: GlBuffer,
    drawingLayer: DrawingLayer
  ): TileController {
    const controller = this.createController(tileData, quad, sourceTexture, buffer, drawingLayer);
    this._tileControllers.push(controller);
    return controller;
  }

  /**
   * create a controller
   * @param tileData
   * @param quad
   * @param sourceTexture
   * @param buffer
   * @returns
   */
  protected createController(
    tileData: RuntimeTileData,
    quad: Quad,
    sourceTexture: Texture,
    buffer: GlBuffer,
    drawingLayer: DrawingLayer
  ): TileController {
    const options = { buffer, tileData, sourceTexture, quad, drawingLayer };
    switch (tileData.data.type) {
      case 'player':
        return new PlayerTile(this.eng, options);
      case 'npc':
        return new NpcTile(this.eng, options);
      case 'static':
        return new StaticTile(this.eng, options);
      case 'tree':
        return new TreeTile(this.eng, options);
    }
  }

  /**
   * Check for a collision between this and other tiles.
   * @param source
   * @param filterMask
   * @param collision
   * @returns
   */
  checkCollision(source: TileController, filterMask?: CollisionTypes, collision?: Readonly<rect>): CollisionResults {
    if (!collision) {
      collision = source.collision;
    }
    const results = new CollisionResults();
    for (let i = 0; i < this._tileControllers.length; i++) {
      const other = this._tileControllers[i];

      // don't collide with yourself
      if (other == source) {
        continue;
      }

      // collect the colliding tiles
      if (collision.intersects(other.collision)) {
        results.pushCollision(other);
      }
    }
    return results;
  }
}
