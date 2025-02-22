import { IBattleData } from '../battle/IBattleData';
import { IEnemyData } from '../battle/IEnemyData';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';

import BG_DATA from '../assets/data/truncated_backgrounds.dat';
import * as BattleBackgroundEngine from '../battleBackgrounds/engine';
import BackgroundLayer from '../battleBackgrounds/rom/background_layer';
import ROM from '../battleBackgrounds/rom/rom';
import { SpritController } from '../graphics/SpriteController';
import { BackgroundComponent } from '../components/BackgroundComponent';
import { EnemyBattleTileComponent } from '../components/EnemyBattleTileComponent';
/**
 * Manages battles including starting them and ending them
 * as well as level up and game over.
 */
export class BattleManager extends Component {
  private _backgroundEngine: any;
  private nextBattle: IBattleData;
  private _activeBattle: boolean;

  private _backgroundSprite: BackgroundComponent;

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
    this._backgroundSprite = new BackgroundComponent(this.eng);
  }

  /**
   * Setup the battle manager
   */
  async initialize(): Promise<void> {
    this._backgroundSprite.initialize();
    const backgroundData = new Uint8Array(
      Array.from(BG_DATA).map((x) => {
        return (x as any).charCodeAt(0);
      })
    );

    const rom = new ROM(backgroundData);
    const layer1 = new BackgroundLayer(271, rom);
    const layer2 = new BackgroundLayer(269, rom);
    const fps = 30;

    // Create animation engine
    this._backgroundEngine = new BattleBackgroundEngine.default([layer1, layer2], {
      fps: fps,
      aspectRatio: 0,
      frameSkip: 1,
      alpha: [0.3, 0.3],
      canvas: this.eng.canvasController.canvas2D,
    });
    this._backgroundEngine.initialize();
  }

  /**
   * When a new battle scene loads it will start here
   * @param level
   */
  loadLevel(level: ILevelData): void {
    // we only want to look at battle scenes
    if (this.eng.scene.type == 'BattleScene') {
      this._activeBattle = true;

      // setup the a random back ground
      this._backgroundEngine.layers[0].loadEntry(Math.floor(this.eng.random.rand() * 325));
      this._backgroundEngine.layers[1].loadEntry(Math.floor(this.eng.random.rand() * 325));

      // find all the enemy components
      this._enemyComponents = this.eng.battleGround.findTile((tile, i, j, k) => {
        return tile instanceof EnemyBattleTileComponent;
      }) as EnemyBattleTileComponent[];
    }
    // not a battle scene
    else {
      this._activeBattle = false;
    }
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
    this._backgroundEngine.update(dt);
    this._backgroundSprite.setImage(this.eng.canvasController.canvas2D);
    this._backgroundSprite.update(dt);
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
