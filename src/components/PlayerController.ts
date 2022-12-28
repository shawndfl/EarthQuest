import { Engine } from '../core/Engine';
import { ISpriteSheetData } from '../core/ISpriteSheetData';
import { Texture } from '../core/Texture';
import { SpritController } from '../environment/SpriteController';
import { Component } from './Component';

export class PlayerController extends Component {
  private _spriteController: SpritController;

  constructor(eng: Engine) {
    super(eng);
  }

  initialize(spriteSheet: Texture, characterData: ISpriteSheetData) {
    this._spriteController = new SpritController(this.gl);
    this._spriteController.initialize(spriteSheet, characterData);
  }

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
