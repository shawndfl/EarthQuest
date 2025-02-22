import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { ITileCreationArgs } from './ITileCreationArgs';
import { OpenTileComponent } from './OpenTileComponent';

/**
 * Half step tile so user can climb up it.
 */
export class HalfStepTileComponent extends OpenTileComponent {
  get tileHeight(): number {
    return this._tilePosition.z - 0.5;
  }

  constructor(eng: Engine, spriteController: SpritBatchController, args: ITileCreationArgs) {
    super(eng, spriteController, args);
  }
}
