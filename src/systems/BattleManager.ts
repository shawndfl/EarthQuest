import { IBattleData } from '../battle/IBattleData';
import { IEnemyData } from '../battle/IEnemyData';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';

/**
 * Manages battles including starting them and ending them
 * as well as level up and game over.
 */
export class BattleManager extends Component {
  private nextBattle: IBattleData;
  private _activeBattle: boolean;

  private _enemyList: IEnemyData[] = [];

  public get enemyList(): IEnemyData[] {
    return this._enemyList;
  }

  public get isActive(): boolean {
    return this._activeBattle;
  }

  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * When a new battle scene loads it will start here
   * @param level
   */
  loadLevel(level: ILevelData): void {
    this._enemyList = [];
  }

  /**
   * Setup the battle manager
   */
  async initialize(): Promise<void> {}

  /**
   * Gives this a changes to load the battle and update the battle
   * @param dt
   */
  update(dt: number): void {
    // see if we should start a battle
    if (this.nextBattle && !this._activeBattle) {
      this.loadBattleLevel();
    }

    // no active battle nothing to do
    if (!this._activeBattle) {
      return;
    }
  }

  /**
   * Queue a battle for the next frame
   * @param data
   */
  queueNextBattle(data: IBattleData) {
    this.nextBattle = data;
  }

  /**
   * Loads the next battle
   */
  private loadBattleLevel(): void {
    console.debug('loading battle ', this.nextBattle);
    this._activeBattle = true;
  }
}
