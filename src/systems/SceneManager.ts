import { Component } from '../components/Component';
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { ISceneFactory } from './ISceneFactory';
import { ILevelData } from '../environment/ILevelData';
import { ILevelRequest, LevelRequest } from '../core/ILevelRequest';
import NewLevel from '../assets/levels/newLevel.json';
import { SceneFactory } from '../core/SceneFactory';
import { TileScene } from '../scenes/TileScene';

/**
 * Manages the active scene and switching from scene to scene.
 */
export class SceneManager extends Component {
  private _worldScene: SceneComponent;
  private _battleScene: SceneComponent;
  private _sceneFactory: ISceneFactory;
  private _tileScene: TileScene;

  private _levelRequest: ILevelRequest;
  private _currentLevel: ILevelData;
  private _previousLevel: ILevelData;

  private _currentBattleLevel: ILevelData;
  private _levelReady: boolean = false;

  public get isLevelReady(): boolean {
    return this._levelReady;
  }

  get levelData(): ILevelData {
    return this._currentLevel;
  }

  get scene(): SceneComponent {
    return this._worldScene;
  }

  constructor(eng: Engine) {
    super(eng);
    this._sceneFactory = this.createSceneFactory();
  }

  /**
   * Setup the scene initialize the first scene and the ground
   */
  async initialize() {
    let levelData: ILevelData;

    // check for a url first
    const url = new URL(window.location.href);
    const levelUrl = url.searchParams.get('level');
    if (levelUrl) {
      levelData = await this.eng.assetManager.requestJson(levelUrl);
    }

    // check local storage
    if (!levelData) {
      const levelDataString = window.localStorage.getItem('lastLevel');
      if (levelDataString) {
        try {
          levelData = JSON.parse(levelDataString);
        } catch (e) {
          console.error('error parsing local storage ', e);
        }
      }
    }

    // use new level
    if (!levelData) {
      levelData = NewLevel;
    }

    // are we loading the editor
    if (url.searchParams.get('editor')) {
      this.eng.showEditor(levelData);
    }

    await this.eng.loadLevel(levelData);
    this._levelReady = true;
  }

  /**
   * Create a scene factory
   * @returns
   */
  createSceneFactory(): ISceneFactory {
    return new SceneFactory(this.eng);
  }

  /**
   * Queue the next level. This level will be loaded on the next frame
   * @param levelData
   */
  public requestNewLevel(levelRequest: ILevelRequest): void {
    this._levelRequest = levelRequest;
  }

  /**
   * Start loading the level. This is async
   * @param levelRequest
   */
  private async startLoadingRequest(levelRequest: ILevelRequest): Promise<void> {
    if (!levelRequest) {
      return;
    }

    this._levelReady = false;

    // load a new battle level from a url
    if (levelRequest.requestType == LevelRequest.battleUrl) {
      const levelData = await this.eng.assetManager.requestJson(levelRequest.levelUrl);
      await this.eng.loadBattle(levelData);
    }
    // load a new level from data
    else if (levelRequest.requestType == LevelRequest.levelData) {
      await this.eng.loadLevel(levelRequest.levelData);
    }
    // load a new level from url
    else if (levelRequest.requestType == LevelRequest.levelUrl) {
      const levelData = await this.eng.assetManager.requestJson(levelRequest.levelUrl);
      await this.eng.loadLevel(levelData);
    }
    // load a last level
    else if (levelRequest.requestType == LevelRequest.previousLevel) {
      const levelData = this._previousLevel;
      await this.eng.loadLevel(levelData);
    }

    this._levelReady = true;
  }

  /**
   * Loads a new level
   * @param level
   */
  async loadLevel(level: ILevelData): Promise<void> {
    this._currentLevel = level;

    const type = level?.controllerType;
    if (!type) {
      console.warn('Level data is missing controllerType');
    }

    // close any open scene
    if (this._worldScene) {
      this._worldScene.closeLevel();
    }

    // create a new scene if needed
    this._worldScene = this._sceneFactory.createScene(type);
    this._worldScene.initialize();

    // load the level
    await this._worldScene.loadLevel(level);
  }

  async loadBattle(level: ILevelData): Promise<void> {
    this._currentBattleLevel = level;

    const type = level?.controllerType;
    if (!type) {
      console.warn('Level data is missing controllerType');
    }

    // close any open scene
    if (this._battleScene) {
      this._battleScene.closeLevel();
    }

    // create a new scene if needed
    this._battleScene = this._sceneFactory.createScene(type);
    this._battleScene.initialize();

    // load the level
    this._battleScene.loadBattle(level);
  }

  closeLevel(): void {
    this._previousLevel = this._currentLevel;
    if (this._worldScene) {
      this._worldScene.closeLevel();
    }
    // end any battle you might be in. Battles are like a sub scene to the world scene
    this.endBattle();
  }

  endBattle(): void {
    if (this._battleScene) {
      this._battleScene.closeLevel();
    }
    this._battleScene = null;
    this._currentBattleLevel = null;
  }

  update(dt: number): void {
    // should we load the next level

    this.startLoadingRequest(this._levelRequest);
    this._levelRequest = null;

    if (this._battleScene) {
      this._battleScene.update(dt);
    } else {
      this.scene.update(dt);
    }
  }
}
