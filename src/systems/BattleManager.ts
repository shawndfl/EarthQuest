import { IEnemyData } from '../battle/IEnemyData';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';

import { EnemyBattleTileComponent } from '../components/EnemyBattleTileComponent';
/**
 * Manages battles including starting them and ending them
 * as well as level up and game over.
 */
export class BattleManager extends Component {
  private _activeBattle: boolean;

  private _enemyList: IEnemyData[] = [];
  private _enemyComponents: EnemyBattleTileComponent[] = [];

  public get enemyList(): IEnemyData[] {
    return this._enemyList;
  }

  public get isActive(): boolean {
    return this._activeBattle;
  }

  constructor(eng: Engine) {
    super(eng);
  }

  initialize(): void {
    //NOP
  }

  /**
   * Happens when a new battle is loaded.
   * @param level
   */
  override async loadBattle(level: ILevelData): Promise<void> {
    this._activeBattle = true;

    // find all the enemy components
    this._enemyComponents = this.eng.scene.ground.findTile((tile, i, j, k) => {
      return tile instanceof EnemyBattleTileComponent;
    }) as EnemyBattleTileComponent[];
  }

  /**
   * When a new battle scene loads it will start here
   * @param level
   */
  override async loadLevel(level: ILevelData): Promise<void> {
    this._activeBattle = false;
  }

  override endBattle(): void {
    this._activeBattle = false;
  }

  /**
   * Gives this a changes to load the battle and update the battle
   * @param dt
   */
  override update(dt: number): void {
    // no active battle nothing to do
    if (!this._activeBattle) {
      return;
    }
  }
}
