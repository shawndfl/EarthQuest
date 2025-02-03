import { IBattleData } from '../battle/IBattleData';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

/**
 * Manages battles including starting them and ending them
 * as well as level up and game over.
 */
export class BattleManager extends Component {
  private nextBattle: IBattleData;
  private _activeBattle: boolean;

  public get isActive(): boolean {
    return this._activeBattle;
  }

  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Setup the battle manager
   */
  async initialize(): Promise<void> {
    //TODO load battle data
  }

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

    console.debug('Fighting!!!');
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
