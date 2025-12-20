import { BackgroundImage } from '../core/BackgroundImage';
import { Engine } from '../core/Engine';
import { BackgroundImageShader } from '../shaders/BackgroundImageShader';
import { Scene } from './Scene';
import { SceneType } from './SceneType';

export class BattleScene extends Scene {
  private _backgroundEngine: any;
  private _backgroundImage: BackgroundImage;

  get type(): SceneType {
    return SceneType.HomeBattle1;
  }

  constructor(eng: Engine) {
    super(eng);
    this._backgroundImage = new BackgroundImage(this.eng);
  }

  async loadLevel(): Promise<void> {
    await this._backgroundImage.initialize();
    const textureUrl = this.eng.assetManager.atlasData['default'];
    const texture = await this.eng.assetManager.getTexture(textureUrl.texture);
    this._backgroundImage.setTexture(texture);
  }

  async createBackground(): Promise<void> {
    //const tileData = this.eng.assetManager.atlasData['simple gree grass'];
  }

  update(dt: number): void {
    // disable depth just draw
    this.gl.depthFunc(this.gl.ALWAYS);

    this._backgroundImage.update(dt);

    this.gl.depthFunc(this.gl.LEQUAL);
  }
}
