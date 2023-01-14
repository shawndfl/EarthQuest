import { Component } from '../components/Component';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Engine } from '../core/Engine';
import MenuImage from '../assets/menu.png';
import MenuImageData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import { DialogComponent } from '../components/DialogComponent';

export class MenuManager extends Component {
  protected _spriteController: SpritBatchController;
  protected _dialog1: DialogComponent;

  constructor(eng: Engine) {
    super(eng);
    this._spriteController = new SpritBatchController(eng);
    this._dialog1 = new DialogComponent(this.eng);
  }

  async initialize() {
    const texture = new Texture(this.gl);
    await texture.loadImage(MenuImage);
    this._spriteController.initialize(texture, MenuImageData);
    this._dialog1.initialize(this._spriteController, {
      eng: this.eng,
      xPos: 20,
      yPos: 40,
      width: 600,
      height: 300,
      continueIconX: 350,
      continueIconY: 75,
      tileWidth: 8,
      tileHeight: 8,
      iconScale: 3,
      minWidth: 20,
      minHeight: 20,
      textHeight: 50,
      textWidth: 300,
      textOffsetX: 20,
      textOffsetY: 50,
    });

    this.createDialog(0, 0, 400, 200);
  }

  createDialog(x: number, y: number, width: number, height: number) {}

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
