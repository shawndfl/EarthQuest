import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve, CurveType } from '../math/Curve';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { DialogBuilder } from './DialogBuilder';
import { IDialogParams } from './IDialogParams';
import { Component } from '../components/Component';
import { PanelComponent } from './PanelComponent';

export class DialogComponent extends PanelComponent {
  private _ready: boolean;
  private _expandAnimation: Curve;

  get id(): string {
    return this._id;
  }

  get visible(): boolean {
    return this._visible;
  }

  constructor(eng: Engine, dialogBuild: DialogBuilder) {
    super(eng, 'dialog1', dialogBuild);
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

  show() {
    super.show();
  }

  hide() {
    super.hide();
  }

  update(dt: number) {
    this._expandAnimation.update(dt);
  }
}
