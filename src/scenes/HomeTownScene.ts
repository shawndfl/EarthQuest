import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DrawingLayer } from '../drawingLayers/DrawingLayer';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { FireFlyTile } from '../tiles/FireFlyTile';
import { NpcTile } from '../tiles/NpcTile';
import { PlayerTile } from '../tiles/PlayerTile';
import { SolidTile } from '../tiles/SolidTile';
import { StaticTile } from '../tiles/StaticTile';
import { Scene } from './Scene';
import { SceneType } from './SceneType';

export class HomeTownScene extends Scene {
  protected _shader: SpritePerspectiveShader;
  private _backgroundLayer: DrawingLayer;
  private _backgroundDetail: DrawingLayer;
  private _characterLayer: DrawingLayer;
  private _overlayLayer: DrawingLayer;

  get type(): SceneType {
    return SceneType.HomeTown;
  }

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
    await this.addTrees();
    await this.createPlayer();
    await this.createStonePath();
    await this.createPoo();
    await this.createFireFly();

    //await this.createHouse();
    await this.createLineOfHouses();
  }

  async createFireFly(): Promise<void> {
    const fireFly = new FireFlyTile(this.eng, 'firefly', {
      initializePosition: new vec3(150, -200, 0.5),
      drawingLayer: this._characterLayer,
      tileDataId: 'particle white',
    });

    // this will handle the update function
    this.eng.tileManager.registerTileForUpdate(fireFly);
    await fireFly.initialize();
  }

  async addTrees(): Promise<void> {
    const tree = new SolidTile(this.eng, 'tree', {
      initializePosition: new vec3(80, -200, 0.5),
      drawingLayer: this._characterLayer,
      tileDataId: 'big tree',
    });

    // this will handle the update function
    //this.eng.tileManager.registerTileForUpdate(house);

    this.eng.collisionManager.registerTileForCollision(tree);
    await tree.initialize();
  }

  async createLineOfHouses(): Promise<void> {
    const promises = [];
    const step = 220;
    const row = 50;
    for (let i = 0; i < 10; i++) {
      const position = new vec2(step * i, 50);
      await this.createHouse(position);
    }
  }

  async createHouse(position: vec2): Promise<void> {
    const tileData = this._backgroundLayer.tileAtlas.tiles['ness house'];

    const house = new SolidTile(this.eng, 'nessHouse_' + this.eng.random.getUuid(), {
      initializePosition: new vec3(...position.xy, 0.5),
      drawingLayer: this._characterLayer,
      tileDataId: 'ness house',
    });

    // this will handle the update function
    //this.eng.tileManager.registerTileForUpdate(house);

    this.eng.collisionManager.registerTileForCollision(house);
    await house.initialize();
    //TODO add portal
    /*
    const portalX = position.x;
    const portalY = position.y;
    const door = new PortalTile(this.eng, {
      initializePosition: new vec3(portalX, portalY, 0.5),
      requestBufferRefresh: (t) => {
        // NO drawing for this
      },
      tileData: null,
    });
    door.setBounds(new rect(portalX, 64, portalY, 64));

    this.eng.collisionManager.registerTileForCollision(door);
    */
  }

  async createPoo(): Promise<void> {
    const tileData = this._backgroundLayer.tileAtlas.tiles['poo'];

    const poo = new NpcTile(this.eng, 'poo', {
      initializePosition: new vec3(50, -50, 0.5),
      drawingLayer: this._characterLayer,
      tileDataId: 'poo',
    });

    // this will handle the update function
    this.eng.tileManager.registerTileForUpdate(poo);

    this.eng.collisionManager.registerTileForCollision(poo);
    await poo.initialize();
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
    const grassBackground = new StaticTile(this.eng, 'grass', {
      initializePosition: new vec3(0, 0, 1),
      drawingLayer: this._backgroundLayer,
      tileDataId: 'simple gree grass',
    });
    grassBackground.initialize();
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
    const backgroundDetail = new StaticTile(this.eng, 'flower_' + tileName + '_' + this.eng.random.getUuid(), {
      initializePosition: new vec3(x, y, 0.6),
      drawingLayer: this._backgroundDetail,
      tileDataId: tileName,
    });
    backgroundDetail.initialize();
  }

  async createPlayer(): Promise<void> {
    const tileData = this._characterLayer.tileAtlas.tiles['ness'];

    const playerTile = new PlayerTile(this.eng, 'player', {
      initializePosition: new vec3(140, 0, 0.5),
      drawingLayer: this._characterLayer,
      tileDataId: 'ness',
    });

    // this will make sure all other systems can access this tile
    this.eng.tileManager.registerPlayerTile(playerTile);

    // this will handle the update function
    this.eng.tileManager.registerTileForUpdate(playerTile);

    // make sure this can collide with other things
    this.eng.collisionManager.registerTileForCollision(playerTile);
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

    this.gl.depthFunc(this.gl.LEQUAL);
  }
}
