import { Component } from '../core/Component';
import { ILevelData, TileData } from '../data/ILevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import { NpcTile } from '../tiles/NpcTile';
import { PlayerTile } from '../tiles/PlayerTile';
import { StaticTile } from '../tiles/StaticTile';
import { TileController } from '../tiles/TileController';
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
    const level: ILevelData = this.eng.gameManager.levelData;
    console.debug('TileManager loading level...');

    // reset the tile controllers
    for (let controller of this._tileControllers) {
      controller.closeLevel();
    }
    this._tileControllers = [];

    // create the drawing layers
    this._drawingLayers = [];
    for (let i = 0; i < level.layers.length; i++) {
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
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
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
    tileData: TileData,
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
    tileData: TileData,
    quad: Quad,
    sourceTexture: Texture,
    buffer: GlBuffer,
    drawingLayer: DrawingLayer
  ): TileController {
    switch (tileData.type) {
      case 'player':
        return new PlayerTile(this.eng, { buffer, tileData, sourceTexture, quad, drawingLayer });
      case 'npc':
        return new NpcTile(this.eng, { buffer, tileData, sourceTexture, quad, drawingLayer });
      case 'static':
        return new StaticTile(this.eng, { buffer, tileData, sourceTexture, quad, drawingLayer });
    }
  }
}
