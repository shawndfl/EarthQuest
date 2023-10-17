import { Engine } from '../core/Engine';
import { ITileCreateionArgs } from '../components/ITileCreationArgs';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

/**
 * This is any thing that the player or some NPC can walk through
 */
export class FreeTileComponent extends TileComponent {

  canAccessTile(tileComponent: TileComponent): boolean {
    return true;
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  constructor(
    eng: Engine,
    protected _spriteController: SpritBatchController,
    args: ITileCreateionArgs
  ) {
    super(eng, args);
    this._spriteController.activeSprite(this.id);
    this._spriteController.setSprite(this.spriteId);
    this._spriteController.scale(this.eng.tileScale);
    this.setTilePosition(args.i, args.j, args.k);
  }
}
