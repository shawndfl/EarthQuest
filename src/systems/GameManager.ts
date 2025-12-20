import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { GameData } from '../data/GameData';
import { ILevelData } from '../data/ILevelData';
import DefaultTileAtlas from '../assets/data/tileAtlas.json';
import { SceneType } from '../scenes/SceneType';

/** Key for local storage */
const localStorageKey = 'EarthQuest';

/**
 * This is the main class that manages game state
 */
export class GameManager extends Component {
  data: GameData;
  private _timeCounter: number;
  private _sceneType: SceneType;

  public get sceneType(): SceneType {
    return this._sceneType;
  }

  constructor(eng: Engine) {
    super(eng);
    this._timeCounter = 0;
  }

  /**
   * Load game data from local storage
   */
  initialize() {
    if (localStorage.getItem(localStorageKey)) {
      this.data = JSON.parse(localStorage[localStorageKey]);
    } else {
      this.data = new GameData();
    }
  }

  /**
   * Keep track of the scene type
   * @param sceneType
   */
  setScene(sceneType: SceneType): void {
    this._sceneType = sceneType;
  }

  /**
   * Save game data in local storage
   */
  save() {
    localStorage[localStorageKey] = JSON.stringify(this.data);
  }

  /**
   * Update the game time
   * @param dt
   */
  update(dt: number) {
    //TODO update player time. Need to add player data to game data.
    /*
    const t = this.data.player.timePlayed;
    this._timeCounter += dt;
    if (this._timeCounter > 1000) {
      t.s++;
      this._timeCounter = this._timeCounter % 1000;
      if (t.s >= 60) {
        t.s -= 60;
        t.m++;
      }

      if (t.m >= 60) {
        t.m -= 60;
        t.h++;
      }
    }
      */
  }
}
