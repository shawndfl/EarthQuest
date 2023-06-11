import { Component } from '../components/Component';
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { SceneFactory } from './SceneFactory';

export class SceneManager extends Component {
  private _activeScene: SceneComponent;
  private _lastScene: SceneComponent;
  private _sceneFactory: SceneFactory;

  get Scene(): SceneComponent {
    return this._activeScene;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sceneFactory = new SceneFactory(eng);
  }

  /**
   * Switch to a different scene.
   * @param newScene
   */
  changeScene(type: string) {
    const newScene = this._sceneFactory.createScene(type);
    if (!newScene) {
      console.error('failed to change scene to ' + type);
      return;
    }

    if (this._activeScene) {
      this._activeScene.HideScene();
    }

    this._lastScene = this._activeScene;
    this._activeScene = newScene;

    this._activeScene.ShowScene();
  }

  /**
   * Called every frame
   * @param dt
   */
  update(dt: number) {}

  /**
   * When the window is resized
   */
  resize(width: number, height: number) {}

  /**
   * Dispose the scene
   */
  dispose() {}
}
