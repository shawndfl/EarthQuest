import { Engine } from '../core/Engine';
import { ITileCreateionArgs } from '../components/ITileCreationArgs';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { OpenTileComponent } from './OpenTileComponent';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

/**
 * Half step tile so user can climb up it.
 */
export class HalfStepTileComponent extends OpenTileComponent {
  get tileHeight(): number {
    return this._tilePosition.z - 0.5;
  }

  constructor(eng: Engine, spriteController: SpritBatchController, args: ITileCreateionArgs) {
    super(eng, spriteController, args);
  }
}
