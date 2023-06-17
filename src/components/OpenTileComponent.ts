import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { TileFactory } from '../systems/TileFactory';
import { TileAccessOptions } from './TileAccessOptions';
import { TileComponent } from './TileComponent';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class OpenTileComponent extends TileComponent {
  protected _tileId: string;
  protected _spriteId: string;
  protected _type: string;

  get id(): string {
    return this._tileId;
  }

  get type(): string {
    return this._type;
  }

  /**
   * Check if the tile component (or player) can access this tile.
   * For open tiles we need to check the tile on top of it.
   * @param tileComponent
   * @returns
   */
  canAccessTile(tileComponent: TileComponent, options: TileAccessOptions): boolean {
    const tileBelow = options.tileBelow;

    // the component is coming from a tile that is one step below this tile
    // check for a slop
    if (tileBelow.tileIndex.z == this.tileIndex.z - 1) {
      // accessing the tile from the left
      if (tileBelow.type.includes('slop.left') && tileBelow.tileIndex.y < this.tileIndex.y) {
        return true;
      }

      // accessing the tile from the right
      if (tileBelow.type.includes('slop.right') && tileBelow.tileIndex.y > this.tileIndex.y) {
        return true;
      }

      // accessing the tile from the top
      if (tileBelow.type.includes('slop.top') && tileBelow.tileIndex.x < this.tileIndex.x) {
        return true;
      }

      // accessing the tile from the bottom
      if (tileBelow.type.includes('slop.bottom') && tileBelow.tileIndex.x > this.tileIndex.x) {
        return true;
      }
    } else if (tileBelow.tileIndex.z == this.tileIndex.z) {
      // tiles are on the same level
      return true;
    }

    return false;
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  constructor(
    eng: Engine,
    protected _spriteController: SpritBatchController,
    typeAndSprite: string,
    i: number,
    j: number,
    k: number
  ) {
    super(eng);
    const parts = typeAndSprite.split('|');
    this._type = parts[0];
    this._spriteId = parts[1];
    this._tileId = TileFactory.createStaticID(i, j, k);
    this._spriteController.activeSprite(TileFactory.createStaticID(i, j, k));

    this._spriteController.setSprite(this._spriteId);
    this._spriteController.scale(this.eng.tileScale);
    this.setTilePosition(i, j, k);
  }
}
