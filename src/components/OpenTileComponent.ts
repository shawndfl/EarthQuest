import { Engine } from '../core/Engine';
import { ITileCreateionArgs } from '../components/ITileCreationArgs';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { TileFactory } from '../systems/TileFactory';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class OpenTileComponent extends TileComponent {

  /**
   * Check if the tile component (or player) can access this tile.
   * For open tiles we need to check the tile on top of it.
   * @param tileComponent
   * @returns
   */
  canAccessTile(tileComponent: TileComponent): boolean {
    // cannot move higher than a half of a step
    const canAccess = Math.abs(tileComponent.tilePosition.z - 1 - this.tileHeight) < 1;
    if (canAccess) {
      return true;
    } else {
      return false;
    }
  }

  onEnter(tileComponent: TileComponent, tileContext: TileContext): void {
    const pos = tileComponent.tilePosition;
    tileComponent.setTilePosition(pos.x, pos.y, this.tileHeight + 1);
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
