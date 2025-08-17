import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DrawingLayer } from '../drawingLayers/DrawingLayer';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { PlayerTile } from '../tiles/PlayerTile';
import { StaticTile } from '../tiles/StaticTile';
import { TileController } from '../tiles/TileController';
import { Scene } from './Scene';

export class HomeTownScene extends Scene {
  private _backgroundLayer: DrawingLayer;
  private _backgroundDetail: DrawingLayer;
  private _characterLayer: DrawingLayer;
  private _overlayLayer: DrawingLayer;

  constructor(eng: Engine) {
    super(eng);
    this._backgroundLayer = new DrawingLayer(this.eng, 'default');
    this._backgroundDetail = new DrawingLayer(this.eng, 'default');
    this._characterLayer = new DrawingLayer(this.eng, 'default');
    this._overlayLayer = new DrawingLayer(this.eng, 'default');
    this._shader = new SpritePerspectiveShader(this.gl, 'main_shader');
  }

  async loadLevel(): Promise<void> {
    // create the drawing layers
    await this._backgroundLayer.loadLevel();
    await this._backgroundDetail.loadLevel();
    await this._characterLayer.loadLevel();
    await this._overlayLayer.loadLevel();

    await this.createBackground();
    await this.addGroundDetail();
    await this.createPlayer();
    await this.createStonePath();
  }

  async createStonePath(): Promise<void> {
    const replacements = ['stone path'];
    const replacementProbability = 0.001; // 1% chance to replace each "00"

    // Function to process each string
    for (let i = -200; i < 288; i++) {
      for (let j = -200; j < 288; j++) {
        if (Math.random() < replacementProbability) {
          const tileName = replacements[Math.floor(Math.random() * replacements.length)];
          this.PlaceBackgroundTile(tileName, i * 8, j * 8);
        }
      }
    }
  }

  async createBackground(): Promise<void> {
    const tileData = this._backgroundLayer.tileAtlas.tiles['simple gree grass'];

    const grassBackground = new StaticTile(this.eng, {
      // tell the character layer to handle the buffer refresh request
      requestBufferRefresh: (t) => {
        this._backgroundLayer.requestRefresh();
      },
      tileData: new RuntimeTileData(this.eng, 'grass', tileData, this._backgroundLayer.texture),
    });

    // this will handle the quad drawing
    this._backgroundLayer.registerQuad(grassBackground.quad);
  }

  async addGroundDetail(): Promise<void> {
    const replacements = [
      'long gree grass',
      'long gree grass flipped',
      'White flower',
      'White flower flipped',
      'Red flower flipped',
    ];
    const replacementProbability = 0.001; // 1% chance to replace each "00"

    // Function to process each string
    for (let i = -200; i < 288; i++) {
      for (let j = -200; j < 288; j++) {
        if (Math.random() < replacementProbability) {
          const tileName = replacements[Math.floor(Math.random() * replacements.length)];
          this.PlaceBackgroundTile(tileName, i * 8, j * 8);
        }
      }
    }
  }

  protected PlaceBackgroundTile(tileName: string, x: number, y: number): void {
    const tileData = this._backgroundDetail.tileAtlas.tiles[tileName];
    const backgroundDetail = new StaticTile(this.eng, {
      // tell the character layer to handle the buffer refresh request
      requestBufferRefresh: (t) => {
        this._backgroundDetail.requestRefresh();
      },
      tileData: new RuntimeTileData(this.eng, 'detail', tileData, this._backgroundDetail.texture),
    });
    backgroundDetail.setPosition(new vec3(x, y, 0));

    // this will handle the quad drawing
    this._backgroundDetail.registerQuad(backgroundDetail.quad);
  }

  async createPlayer(): Promise<void> {
    const tileData = this._characterLayer.tileAtlas.tiles['ness'];

    const playerTile = new PlayerTile(this.eng, {
      // tell the character layer to handle the buffer refresh request
      requestBufferRefresh: (t) => {
        this._characterLayer.requestRefresh();
      },
      tileData: new RuntimeTileData(this.eng, 'ness', tileData, this._characterLayer.texture),
    });

    // this will handle the update function
    this.eng.tileManager.registerTileForUpdate(playerTile);

    // this will handle the quad drawing
    this._characterLayer.registerQuad(playerTile.quad);

    await playerTile.initialize();
  }

  closeLevel(): void {
    this._backgroundLayer.closeLevel();
    this._backgroundDetail.closeLevel();
    this._characterLayer.closeLevel();
    this._overlayLayer.closeLevel();
  }

  update(dt: number): void {
    // disable depth just draw
    this.gl.depthFunc(this.gl.ALWAYS);

    this._backgroundLayer.update(dt);
    this._backgroundDetail.update(dt);
    this._characterLayer.update(dt);
    //this._overlayLayer.update(dt);

    this.gl.depthFunc(this.gl.LEQUAL);
  }
}
