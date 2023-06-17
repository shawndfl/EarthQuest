import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import { OpenTileComponent } from './OpenTileComponent';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class PortalTileComponent extends OpenTileComponent {
  onEnter(tileComponent: TileComponent, tileContext: TileContext): void {
    if (tileComponent.type == 'player') {
      const player = this.eng.scene.player;
      player.canWalk = false;
      this.eng.scene.ground.buildLevel({ seed: 2003, length: 50, width: 40, height: 10, playerPos: new vec2(1, 1) });
      player.canWalk = true;
    }
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
