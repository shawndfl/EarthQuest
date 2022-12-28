import { Engine } from '../core/Engine';
import { GlBuffer } from '../core/GlBuffer';
import { ShaderController } from '../core/ShaderController';
import { Texture } from '../core/Texture';
import { Component } from './Component';

export class PlayerController extends Component {
  private _spriteSheet: Texture;
  private _buffer: GlBuffer;
  private _shader: ShaderController;
  private _shaderInfo: {
    attr: { aPos: number; aTex: number };
    uniform: { uSampler: number };
  };

  constructor(eg: Engine) {
    super(eg);
  }

  initialize(spriteSheet: Texture) {
    this._spriteSheet = spriteSheet;
  }

  setSpriteActive() {}
}
