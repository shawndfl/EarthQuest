import { Engine } from '../core/Engine';

import { SpritBatchController } from '../graphics/SpriteBatchController';

import { OpenTileComponent } from './OpenTileComponent';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

export class HalfStepTileComponent extends OpenTileComponent {
  get tileHeight(): number {
    return this._tilePosition.z - 0.5;
  }

  constructor(
    eng: Engine,
    spriteController: SpritBatchController,
    typeAndSprite: string,
    i: number,
    j: number,
    k: number
  ) {
    super(eng, spriteController, typeAndSprite, i, j, k);
  }
}
