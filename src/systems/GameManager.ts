import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GameData } from '../data/GameData';

/** Key for local storage */
const localStorageKey = 'EarthQuest';

/**
 * This is the main class that manages game state
 */
export class GameManager extends Component {
  data: GameData;

  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Load game data from local storage
   */
  initialize() {
    if (localStorage.getItem(localStorageKey)) {
      this.data = localStorage[localStorageKey];
    } else {
      this.data = new GameData();
    }
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
    const t = this.data.player.timePlayed;
    t.s += Math.floor(dt / 1000);
    if (t.s >= 60) {
      t.s -= 60;
      t.m++;
    }

    if (t.m >= 60) {
      t.m -= 60;
      t.h++;
    }
  }
}
