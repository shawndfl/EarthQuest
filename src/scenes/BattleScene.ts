import { BackgroundImage } from '../core/BackgroundImage';
import { Engine } from '../core/Engine';
import { Scene } from './Scene';
import { SceneType } from './SceneType';
import BG_DATA from '../assets/data/truncated_backgrounds.dat';
import * as BattleBackgroundEngine from '../battleBackgrounds/engine';
import BackgroundLayer from '../battleBackgrounds/rom/background_layer';
import ROM from '../battleBackgrounds/rom/rom';
import { Curve } from '../math/Curve';

export class BattleScene extends Scene {
  private _backgroundEngine: any;
  private _backgroundImage: BackgroundImage;
  private _changeTimer: number = 0;
  private _maxTime = 5000;

  get type(): SceneType {
    return SceneType.HomeBattle1;
  }

  constructor(eng: Engine) {
    super(eng);
    this._backgroundImage = new BackgroundImage(this.eng);
  }

  async loadLevel(): Promise<void> {
    const backgroundData = new Uint8Array(
      Array.from(BG_DATA).map((x) => {
        return (x as any).charCodeAt(0);
      })
    );

    const rom = new ROM(backgroundData);
    const layer1 = new BackgroundLayer(271, rom);
    const layer2 = new BackgroundLayer(269, rom);
    const fps = 30;

    // Create animation engine
    this._backgroundEngine = new BattleBackgroundEngine.default([layer1, layer2], {
      fps: fps,
      aspectRatio: 0,
      frameSkip: 1,
      alpha: [0.3, 0.3],
      canvas: this.eng.canvas2D,
    });
    this._backgroundEngine.initialize();
    // setup the a random back ground
    this._backgroundEngine.layers[0].loadEntry(Math.floor(this.eng.random.mathRand() * 325));
    this._backgroundEngine.layers[1].loadEntry(Math.floor(this.eng.random.mathRand() * 325));

    await this._backgroundImage.initialize();
    const textureUrl = this.eng.assetManager.atlasData['default'];
    //const texture = await this.eng.assetManager.getTexture(textureUrl.texture);
    //this._backgroundImage.setTexture(texture);
  }

  async createBackground(): Promise<void> {
    //const tileData = this.eng.assetManager.atlasData['simple gree grass'];
  }

  update(dt: number): void {
    this._changeTimer += dt;
    if (this._changeTimer > this._maxTime) {
      // setup the a random back ground
      this._backgroundEngine.layers[0].loadEntry(Math.floor(this.eng.random.mathRand() * 325));
      this._backgroundEngine.layers[1].loadEntry(Math.floor(this.eng.random.mathRand() * 325));
      this._changeTimer = 0;
    }
    // disable depth just draw
    this.gl.depthFunc(this.gl.ALWAYS);

    this._backgroundEngine.update(dt);
    this._backgroundImage.setImage(this.eng.canvas2D);
    this._backgroundImage.update(dt);

    this.gl.depthFunc(this.gl.LEQUAL);
  }
}
