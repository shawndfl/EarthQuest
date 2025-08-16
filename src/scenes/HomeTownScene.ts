import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DrawingLayer } from '../drawingLayers/DrawingLayer';
import { Texture } from '../graphics/Texture';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { PlayerTile } from '../tiles/PlayerTile';
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

    this.createPlayer();
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

    //this._backgroundLayer.update(dt);
    //this._backgroundDetail.update(dt);
    this._characterLayer.update(dt);
    //this._overlayLayer.update(dt);

    this.gl.depthFunc(this.gl.LEQUAL);
  }
}
