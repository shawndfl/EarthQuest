import { Component } from '../components/Component';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Engine } from '../core/Engine';
import { DialogComponent } from '../menus/DialogComponent';
import { UserAction } from '../core/UserAction';
import { InputState } from '../core/InputHandler';
import { MenuComponent } from '../menus/MenuComponent';
import { DialogBuilder } from '../menus/DialogBuilder';

/**
 * Manages dialog boxes
 */
export class DialogManager extends Component {
  protected _spriteController: SpritBatchController;
  protected _dialog: DialogComponent;
  protected _menu: MenuComponent;
  protected _dialogBuild: DialogBuilder;

  onHide: (dialog: DialogComponent) => boolean;

  constructor(eng: Engine) {
    super(eng);

    this._dialogBuild = new DialogBuilder(eng);
    this._spriteController = new SpritBatchController(eng);
    this._dialog = new DialogComponent(this.eng, this._dialogBuild);
    this._menu = new MenuComponent(this.eng);
  }

  async initialize() {
    const texture = this.eng.assetManager.menu.texture;
    const data = this.eng.assetManager.menu.data;
    this._spriteController.initialize(texture, data);
    this._dialog.initialize(this._spriteController);
    this._menu.initialize(this._spriteController);
    this._spriteController.commitToBuffer();
  }

  /**
   * Handles user actions for the menu
   * @param action
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    const active = this._dialog.visible;
    if (active && (state.action & UserAction.ActionPressed) > 0) {
      let canHide = true;

      // if there is an onHide event fire that
      if (this.onHide) {
        canHide = this.onHide(this._dialog);
      }

      if (canHide) {
        this._dialog.hide();
      }
    }

    return active;
  }

  /**
   * Shows a dialog box
   * @param text
   * @param loc
   */
  showDialog(text: string, loc: { x: number; y: number; width: number; height: number }, options?: {}[]) {
    this._dialog.setPosition(loc.x, loc.y);
    this._dialog.setSize(loc.width, loc.height);
    this._dialog.setText(text);
    this._dialog.show();
  }

  showGameMenu() {}

  /**
   * Updates the dialog box
   * @param dt
   */
  update(dt: number) {
    this._spriteController.update(dt);
  }
}
