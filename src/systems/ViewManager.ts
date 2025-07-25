import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import * as MathConst from '../math/constants';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';

/**
 * The View manager is used to move the project.
 */
export class ViewManager extends Component {
  protected _screenX: number;
  protected _screenY: number;
  protected _screenW: number;
  protected _screenH: number;

  protected _left: number;
  protected _right: number;
  protected _top: number;
  protected _bottom: number;

  protected _targetX: number;
  protected _targetY: number;

  protected _lastTargetX: number;
  protected _lastTargetY: number;

  protected _scale: number;
  protected _projection: mat4;

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
    this.updateProjection();
  }
  get scale() {
    return this._scale;
  }

  get left(): number {
    return this._left;
  }
  get top(): number {
    return this._top;
  }
  get bottom(): number {
    return this._bottom;
  }
  get right(): number {
    return this._right;
  }

  get projection(): mat4 {
    return this._projection;
  }

  constructor(eng: Engine) {
    super(eng);

    this._targetX = 0;
    this._targetY = 0;

    this._top = 0;
    this._left = 0;
    this._right = 0;
    this._bottom = 0;

    mat4.orthographic(this._left, this._right, this._bottom, this._top, 1, -1, this._projection);
    this._screenX = 0;
    this._screenY = 0;
    this._screenW = 800;
    this._screenH = 600;
  }

  initialize(): void {
    this._screenW = this.eng.width;
    this._screenH = this.eng.height;
    this.scale = 1.0;
  }

  /**
   * Set the target for the project
   * @param x
   * @param y
   */
  setTarget(x: number, y: number): mat4 {
    this._targetX = x;
    this._targetY = y;

    return this.updateProjection();
  }

  updateProjection(): mat4 {
    this._screenX = Math.floor(this._targetX);
    if (this.minX && this.maxX) {
      this._screenX = MathConst.clamp(this._targetX, this.minX, this.maxX);
    }

    this._screenY = Math.floor(this._targetY);
    if (this.minY && this.maxY) {
      this._screenY = MathConst.clamp(this._targetY, this.minY, this.maxY);
    }

    this._left = this._screenX + (this.eng.width - this.eng.width * this._scale);
    this._bottom = this._screenY + (this.eng.height - this.eng.height * this._scale);
    this._right = this.eng.width * this._scale + this._screenX;
    this._top = this.eng.height * this._scale + this._screenY;

    this._projection = mat4.orthographic(this._left, this._right, this._bottom, this._top, 1, -1, this._projection);
    return this._projection;
  }

  update(dt: number) {}
}
