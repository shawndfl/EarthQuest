import { IBattleData } from '../battle/IBattleData';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { Curve, CurveType } from '../math/Curve';

/**
 * Manages the active battle
 */
export class BattleManager extends Component {
  protected _active: boolean;
  private _ready: boolean;
  private _curve: Curve;

  constructor(eng: Engine) {
    super(eng);
    this._active = false;
    this._curve = new Curve();
    this._curve.points([
      { p: 1, t: 0 },
      { p: 0.55, t: 500 },
      { p: 0.55, t: 5000 },
      { p: 1, t: 5500 },
    ]);
    this._curve.curve(CurveType.linear);
    this._curve.pause();
    this._curve.onDone = () => {
      this._ready = true;
    };
  }

  /**
   * Initialize the battle
   */
  async initialize() {}

  startBattle(battleData: IBattleData) {
    // TODO show transition
    // load battle scene
    // show enemies
    // show player
    // show menu options
    // show stats
    this._ready = false;
    this._active = true;
    this._curve.start(
      true,
      () => {
        this._ready = true;
      },
      (value) => {
        this.eng.viewManager.scale = this._curve.getValue();
      }
    );
  }

  update(dt: number) {
    this._curve.update(dt);
  }
}
