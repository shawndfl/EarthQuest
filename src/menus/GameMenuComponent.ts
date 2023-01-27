import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { Component } from '../components/Component';
import { GameMenuBuilder } from './GameMenuBuilder';
import { InputState } from '../core/InputHandler';
import { UserAction } from '../core/UserAction';
import { DialogCursor } from './DialogCursor';

/**
 * The game menu. The player can equip, use items and see stats
 */
export class GameMenuComponent extends Component {
  protected _id: string;
  protected _spriteController: SpritBatchController;
  protected _visible: boolean;
  protected _pos: vec2;
  protected _size: vec2;
  protected _text: string;
  protected _textOffset: vec2;
  protected _dirty: boolean;
  protected _cursor: DialogCursor;

  onHide: (dialog: GameMenuComponent) => boolean;

  get id(): string {
    return this._id;
  }

  get visible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine, id: string, protected _dialogBuild: GameMenuBuilder) {
    super(eng);
    this._id = id;
    this._visible = false;
    this._pos = new vec2();
    this._size = new vec2(300, 200);
    this._textOffset = new vec2(50, 60);
    this._dirty = false;
    this._cursor = new DialogCursor(eng);
  }

  initialize(spriteController: SpritBatchController) {
    this._spriteController = spriteController;
    this._dialogBuild.initialize(this._spriteController);
    this._cursor.initialize('cursor.1', this._spriteController, [new vec2(50, 480), new vec2(50, 460)]);
  }

  setPosition(x: number, y: number) {
    this._pos.x = x;
    this._pos.y = y;
    this._dirty = true;
  }

  show() {
    this._visible = true;
    this._dirty = true;
    this._cursor.show();
  }

  hide() {
    this._visible = false;
    this._dirty = true;
  }

  /**
   * Handle user interaction with the dialog
   * @param state
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    const active = this.visible;
    if (active && (state.action & UserAction.MenuPressed) > 0) {
      let canHide = true;

      // if there is an onHide event fire that
      if (this.onHide) {
        canHide = this.onHide(this);
      }

      if (canHide) {
        this.hide();
      }
    }

    return active;
  }

  redraw() {
    if (this.visible) {
      this._dialogBuild.show();

      this._spriteController.commitToBuffer();

      const textPos = new vec2(this._pos.x + this._textOffset.x, this._pos.y + this._textOffset.y);
      this.eng.textManager.setTextBlock({
        id: this.id,
        text: this._text,
        position: textPos,
        color: new vec4([0.9, 0.9, 1.0, 1.0]),
        depth: -1,
        scale: 1.0,
      });
    } else {
      this.eng.textManager.hideText(this.id);
      this._dialogBuild.hide();
      this._cursor.hide();
    }
  }
  update(dt: number) {
    if (this._dirty) {
      this.redraw();
      this._dirty = false;
    }

    this._cursor.update(dt);
  }
}
