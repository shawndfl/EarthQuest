import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import * as MathConst from '../math/constants';

/**
 * The View manager is used to move the project.
 */
export class ViewManager extends Component {
  protected _screenX: number;
  protected _screenY: number;

  protected _targetX: number;
  protected _targetY: number;
  protected _scale: number;
  protected readonly _minScale = 0.01;

  minX: number;
  maxX: number;
  minY: number;
  maxY: number;

  get screenX() {
    return this._screenX;
  }

  get screenY() {
    return this._screenY;
  }

  /**
   * Scale the width and height of the project
   */
  set scale(value: number) {
    this._scale = value < this._minScale ? this._minScale : value;
  }
  get scale() {
    return this._scale;
  }

  constructor(eng: Engine) {
    super(eng);
    this.minX = -1000;
    this.maxX = 1000;
    this.minY = -1000;
    this.maxY = 1000;

    this._targetX = 0;
    this._targetY = 0;

    this._screenX = 0;
    this._screenY = 0;

    this.scale = 1.0;
  }

  setTarget(x: number, y: number) {
    this._targetX = x;
    this._targetY = y;

    this._screenX = Math.floor(MathConst.Clamp(this._targetX, this.minX, this.maxX));
    this._screenY = Math.floor(MathConst.Clamp(this._targetY, this.minY, this.maxY));
    //console.debug('screen   ' + this._screenX + ', ' + this._screenY);
    //this._screenY = this._screenY & 0xfffffffc;
    //this._screenX = this._screenX & 0xfffffffe;
    //this._screenY = this._screenY & 0xfffffffe;
    //console.debug('  screen ' + this._screenX + ', ' + this._screenY);
  }

  update(dt: number) {}
}
