import { Engine } from '../core/Engine';
import { Curve, CurveType } from '../math/Curve';
import { DialogBuilder } from './DialogBuilder';
import { PanelComponent } from './PanelComponent';

/**
 * A dialog component that can be sized and display text in the game.
 * There is also an onHide event to handle user input
 */
export class DialogBattleInfoComponent extends PanelComponent {
  private _expandAnimation: Curve;

  get id(): string {
    return this._id;
  }

  constructor(eng: Engine, dialogBuild: DialogBuilder, id: string) {
    super(eng, id, dialogBuild);
    this.setPosition(10, 10);
    this.setSize(780, 200);
    this._expandAnimation = new Curve();
    this._expandAnimation.curve(CurveType.linear);
    this._expandAnimation.points([
      { t: 0, p: 0 },
      { t: 250, p: 1 },
      { t: 500, p: 2 },
    ]);
  }

  show() {
    super.show();
  }

  hide() {
    super.hide();
    this.eng.textManager.hideText(this.id);
    this._dialogBuild.hideDialog(this.id);
  }

  redraw() {
    super.redraw();
    if (this.visible) {
      // add the cursor and the positions it can be placed at
    }
  }

  update(dt: number) {
    super.update(dt);
    this._expandAnimation.update(dt);
  }
}
