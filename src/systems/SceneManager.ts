import { Component } from '../components/Component';
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import Level1 from '../assets/levels/level1.json';
import { ISceneFactory } from './ISceneFactory';
import { DefaultSceneFactory } from './DefaultSceneFactory';
import { ILevelData } from '../environment/ILevelData';

/**
 * Manages the active scene and switching from scene to scene. 
 */
export class SceneManager extends Component {
  private _activeScene: SceneComponent;
  private _sceneFactory: ISceneFactory;

  get scene(): SceneComponent {
    return this._activeScene;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sceneFactory = this.createSceneFactory();
  }

  async initialize() {

  }

  createSceneFactory(): ISceneFactory {
    return new DefaultSceneFactory(this.eng);
  }

  /**
  * Loads a new level
  * @param level 
  */
  loadLevel(level: ILevelData): void {
    const type = level?.controllerType;
    if (!type) {
      console.warn('Level data is missing controllerType');
    }

    // close any open scene
    this.closeLevel();

    // create a new scene if needed
    this._activeScene = this._sceneFactory.createScene(type);

    // load the level
    this._activeScene.loadLevel(level);
  }

  closeLevel(): void {
    if (this._activeScene) {
      this._activeScene.closeLevel();
    }
  }
}
