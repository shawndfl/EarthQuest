import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve, CurveType } from '../math/Curve';
import vec2 from '../math/vec2';

/**
 * A cursor used for player selection in menus and dialogs
 */
export class DialogCursor extends Component {
  /** sprite batch that holds the cursor */
  private _spriteController: SpritBatchController;
  /** List of locations in pixels the cursor can be at */
  private _positions: vec2[];
  /** the current position of the cursor */
  private _activePosition: vec2;
  /** the active index */
  private _activeIndex: number;
  /** animation curve */
  protected _cursorCurve: Curve; // used for animations

  private _cursorId: string;

  get index() {
    return this._activeIndex;
  }

  get position(): vec2 {
    return this._activePosition;
  }

  constructor(eng: Engine) {
    super(eng);
    this._positions = [];
    this._activeIndex = -1;
    this._activePosition = new vec2(0, 0);
    this._cursorCurve = new Curve();
    this._cursorCurve.points([
      {
        p: 0,
        t: 0,
      },
      {
        p: 10,
        t: 500,
      },
      {
        p: 0,
        t: 1000,
      },
    ]);
    this._cursorCurve.curve(CurveType.linear);
    this._cursorCurve.repeat(-1);
  }

  initialize(id: string, spriteController: SpritBatchController, positions: vec2[]) {
    this._spriteController = spriteController;
    this._positions = positions;
    this._cursorId = id;
  }

  show() {
    this._spriteController.activeSprite(this._cursorId);
    this._spriteController.scale(0.9);
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
    this._spriteController.setSprite('cursor');
    this._spriteController.setSpritePosition(80, 490, -0.3);

    this._cursorCurve.start(true, undefined, (val) => {
      this._spriteController.activeSprite(this._cursorId);
      this._spriteController.setSpritePosition(80 + val, 490, -0.3, true);
    });
  }

  /**
   * Cause the cursor to stop moving as the player selected somthing
   */
  select() {
    this._cursorCurve.pause(0);
  }

  /**
   * Hide the cursor
   */
  hide() {
    this._spriteController.removeSprite(this._cursorId);
  }

  /**
   * Updates the animation
   * @param dt
   */
  update(dt: number) {
    this._cursorCurve.update(dt);
  }
}
