import { EmptyTileId } from '../core/EmptyTileId';
import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { GroundManager } from '../systems/GroundManager';
import { TileComponent } from './TileComponent';

/**
 * An empty tile is one that doesn't render anything
 */
export class EmptyTile extends TileComponent {
  get spriteController(): SpritBaseController {
    return null;
  }

  get id(): string {
    return EmptyTileId;
  }

  constructor(eng: Engine, groundManager: GroundManager, i?: number, j?: number, k?: number) {
    super(eng, {
      type: EmptyTileId,
      sprite: null,
      i,
      j,
      k,
      groundManager: groundManager,
      flags: null,
    });

    if (i && j && k) {
      this.setTilePosition(i, j, k);
    }
  }
}
