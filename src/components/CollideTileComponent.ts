import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { ITileCreationArgs } from './ITileCreationArgs';
import { TileComponent } from './TileComponent';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class CollideTileComponent extends TileComponent {
  canAccessTile(tileComponent: TileComponent): boolean {
    return false;
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  constructor(eng: Engine, protected _spriteController: SpritBatchController, args: ITileCreationArgs) {
    super(eng, args);
    this._spriteController.activeSprite(this.id);
    this._spriteController.setSprite(this.spriteId);
    this._spriteController.scale(this.eng.tileScale);

    this.setTilePosition(args.i, args.j, args.k);
  }
}
