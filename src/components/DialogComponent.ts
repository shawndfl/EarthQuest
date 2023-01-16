import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve, CurveType } from '../math/Curve';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { DialogBuilder } from '../menus/DialogBuilder';
import { IDialogParams } from '../menus/IDialogParams';
import { Component } from './Component';

export class DialogComponent extends Component {
  protected _id: string;
  protected _spriteController: SpritBatchController;
  protected _visible: boolean;
  private _ready: boolean;
  private _expandAnimation: Curve;
  params: IDialogParams;

  get id(): string {
    return this._id;
  }

  get visible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine) {
    super(eng);
    this._id = 'dialog1';
    this._visible = false;
    this._expandAnimation = new Curve();
    this._expandAnimation.curve(CurveType.linear);
    this._expandAnimation.points([
      { t: 0, p: 0 },
      { t: 250, p: 1 },
      { t: 500, p: 2 },
    ]);
  }

  initialize(spriteController: SpritBatchController, params: IDialogParams) {
    this._spriteController = spriteController;
    this.params = params;
  }

  show(text: string, loc: { x: number; y: number; width: number; height: number }) {
    const p = this.params;
    this._visible = true;

    DialogBuilder.buildDialog(this.id, this._spriteController, p);

    const textPos = new vec2(p.xPos + p.textOffsetX, p.yPos + p.textOffsetY);
    this.eng.textManager.setTextBlock({
      id: this.id,
      text: text,
      position: new vec2(textPos.x, textPos.y),
      color: new vec4([0.9, 0.9, 1.0, 1.0]),
      depth: -1,
      scale: 1.0,
    });
  }

  hide() {
    this._visible = false;
    this.eng.textManager.hideText(this.id);
    DialogBuilder.hideDialog(this.id, this._spriteController);
  }

  update(dt: number) {
    this._expandAnimation.update(dt);
  }
}
