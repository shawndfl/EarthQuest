import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve, CurveType } from '../math/Curve';
import { DialogBuilder } from './DialogBuilder';
import { IDialogParams } from './IDialogParams';

export class MenuComponent extends Component {
  protected _id: string;
  protected _spriteController: SpritBatchController;
  protected _visible: boolean;
  private _ready: boolean;
  private _expandAnimation: Curve;
  params: IDialogParams;

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

  initialize(spriteController: SpritBatchController) {
    this._spriteController = spriteController;
  }
}
