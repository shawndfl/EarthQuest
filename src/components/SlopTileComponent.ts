import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { SpritController } from '../graphics/SpriteController';
import { Component } from './Component';
import { TileComponent } from './TileComponent';

export class SlopTileComponent extends TileComponent {
  protected _type: string;

  get id(): string {
    return this._spriteId;
  }

  get type(): string {
    return this._type;
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  constructor(
    eng: Engine,
    protected _spriteController: SpritBatchController,
    protected _spriteId: string
  ) {
    super(eng);
    this._type = 'slop.unknown';
  }
}
