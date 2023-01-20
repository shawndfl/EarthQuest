import { Component } from '../components/Component';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Engine } from '../core/Engine';
import MenuImage from '../assets/menu.png';
import MenuImageData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import { DialogComponent } from '../components/DialogComponent';
import { UserAction } from '../core/UserAction';
import { IDialogParams } from '../menus/IDialogParams';
import { DefaultDialogParams } from '../menus/DefaultDialogParams';
import { InputState } from '../core/InputHandler';

/**
 * Manages dialog boxes
 */
export class DialogManager extends Component {
  protected _spriteController: SpritBatchController;
  protected _dialog: DialogComponent;
  protected _defaultDialogParams: IDialogParams;
  onHide: (dialog: DialogComponent) => boolean;

  constructor(eng: Engine) {
    super(eng);
    this._spriteController = new SpritBatchController(eng);
    this._dialog = new DialogComponent(this.eng);
    this._defaultDialogParams = new DefaultDialogParams(this.eng);
  }

  async initialize() {
    const texture = new Texture(this.gl);
    await texture.loadImage(MenuImage);
    this._spriteController.initialize(texture, MenuImageData);
    this._dialog.initialize(this._spriteController, this._defaultDialogParams);
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
  showDialog(text: string, loc: { x: number; y: number; width: number; height: number }) {
    this._dialog.show(text, loc);
  }

  /**
   * Updates the dialog box
   * @param dt
   */
  update(dt: number) {
    this._spriteController.update(dt);
  }
}
