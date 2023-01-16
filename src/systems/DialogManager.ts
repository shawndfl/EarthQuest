import { Component } from '../components/Component';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Engine } from '../core/Engine';
import MenuImage from '../assets/menu.png';
import MenuImageData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import { DialogComponent } from '../components/DialogComponent';
import { UserAction } from '../core/UserAction';
import { IDialogParams } from '../menus/IDialogParams';
import { DefaultDialogParams } from '../menus/DefaultDialogParams';

export class DialogManager extends Component {
  protected _spriteController: SpritBatchController;
  protected _dialog: DialogComponent;
  protected _defaultDialogParams: IDialogParams;

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

  handleUserAction(action: UserAction): boolean {
    const active = this._dialog.visible;
    if ((action & UserAction.ActionPressed) > 0) {
      this._dialog.hide();
    }

    return active;
  }

  showDialog(text: string, loc: { x: number; y: number; width: number; height: number }) {
    this._dialog.show(text, loc);
  }

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
