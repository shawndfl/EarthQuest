import { Engine } from '../core/Engine';
import { LevelRequest } from '../core/ILevelRequest';
import { ILevelData } from '../environment/ILevelData';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { ITileCreationArgs } from './ITileCreationArgs';
import { OpenTileComponent } from './OpenTileComponent';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class PortalTileComponent extends OpenTileComponent {
  onEnter(tileComponent: TileComponent, tileContext: TileContext): void {
    if (tileComponent.type == 'player') {
      const player = this.eng.scene.ground.worldPlayer;
      player.canWalk = false;

      // clear out the position so that the player position is loaded from the level
      this.eng.gameManager.data.player.position = null;

      this.eng.sceneManager.requestNewLevel({
        levelUrl: 'assets/levels/level2.json',
        requestType: LevelRequest.levelUrl,
      });

      player.canWalk = true;
    }
  }

  constructor(eng: Engine, spriteController: SpritBatchController, args: ITileCreationArgs) {
    super(eng, spriteController, args);
  }
}
