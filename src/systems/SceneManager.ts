import { Component } from '../core/Component';
import { BattleScene } from '../scenes/BattleScene';
import { HomeTownScene } from '../scenes/HomeTownScene';
import { Scene } from '../scenes/Scene';
import { SceneType } from '../scenes/SceneType';

export class SceneManager extends Component {
  activeScene: Scene;
  protected _sceneReady: boolean;

  async initialize(): Promise<void> {
    this.activeScene = new HomeTownScene(this.eng);
  }

  /**
   * Loads a new level
   */
  async loadLevel(): Promise<void> {
    this.activeScene = this.createScene(this.eng.gameManager.sceneType);
    await this.activeScene.loadLevel();
    this._sceneReady = true;
  }

  /**
   * Create the scene based on the scene type of from teh game manager
   * @param sceneType
   * @returns
   */
  protected createScene(sceneType: SceneType): Scene {
    switch (sceneType) {
      case SceneType.HomeTown:
        return new HomeTownScene(this.eng);
      case SceneType.HomeBattle1:
        return new BattleScene(this.eng);
    }
  }

  isSceneReady(): boolean {
    return this._sceneReady;
  }

  resize(width: number, height: number): void {
    this.activeScene.resize(width, height);
  }

  update(dt: number): void {
    if (this._sceneReady) {
      this.activeScene.update(dt);
    }
  }
}
