import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { DialogBuilder } from '../menus/DialogBuilder';
import { IDialogParams } from '../menus/IDialogParams';
import { Component } from './Component';

export class DialogComponent extends Component {
  protected _spriteController: SpritBatchController;

  constructor(eng: Engine) {
    super(eng);
  }

  initialize(spriteController: SpritBatchController, params: IDialogParams) {
    DialogBuilder.buildDialog(spriteController, params);
    const textPos = new vec2(
      params.xPos + params.textOffsetX,
      params.yPos + params.textOffsetY
    );

    this.eng.textManager.setTextBlock({
      id: 'Dialog1',
      text: 'Welcome to Earth Quest!',
      position: new vec2(textPos.x, textPos.y),
      color: new vec4([0.9, 0.9, 1.0, 1.0]),
      depth: -1,
      scale: 1.0,
    });
  }

  update(dt: number) {}
}
