import { IBattleData } from '../battle/IBattleData';
import { IEnemyData } from '../battle/IEnemyData';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';

import BG_DATA from '../assets/data/truncated_backgrounds.dat';
import * as BattleBackgroundEngine from '../battleBackgrounds/engine';
import BackgroundLayer from '../battleBackgrounds/rom/background_layer';
import ROM from '../battleBackgrounds/rom/rom';
/**
 * Manages battles including starting them and ending them
 * as well as level up and game over.
 */
export class BattleManager extends Component {
  private backgroundEngine: any;
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

    const backgroundData = new Uint8Array(
      Array.from(BG_DATA).map((x) => {
        return (x as any).charCodeAt(0);
      })
    );

    const rom = new ROM(backgroundData);
    const layer1 = new BackgroundLayer(270, rom);
    const layer2 = new BackgroundLayer(269, rom);
    const fps = 30;

    // Create animation engine
    const backgroundEngine = new BattleBackgroundEngine.default([layer1, layer2], {
      fps: fps,
      aspectRatio: 0,
      frameSkip: 1,
      alpha: [0.5, 0.5],
      canvas: document.querySelector('canvas#demo'),
    });
    backgroundEngine.animate();
  }

  /**
   * When a new battle scene loads it will start here
   * @param level
   */
  loadLevel(level: ILevelData): void {
    // we only want to look at battle scenes
    if (this.eng.scene.type == 'BattleScene') {
      this._activeBattle = true;
      const enemyComponents = this.eng.ground.findTile((tile, i, j, k) => {
        if (tile.type == 'enemy.battle') {
          console.debug('FOUND! ' + i + ', ' + j + ', ' + k, tile);
        }
        return tile.type.startsWith('enemy.battle');
      });
      console.debug('enemies ', enemyComponents);
      this._enemyList = [];
    }
    // not a battle scene
    else {
      this._activeBattle = false;
    }
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
