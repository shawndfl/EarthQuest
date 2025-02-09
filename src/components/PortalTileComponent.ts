import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import { ITileCreateionArgs } from './ITileCreationArgs';
import { OpenTileComponent } from './OpenTileComponent';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class PortalTileComponent extends OpenTileComponent {
  onEnter(tileComponent: TileComponent, tileContext: TileContext): void {
    if (tileComponent.type == 'player') {
      const player = this.eng.player;
      player.canWalk = false;

      this.eng.assetManager.requestJson('assets/levels/level2.json').then((levelData: ILevelData) => {
        // clear out the position so that the player position is loaded from the level
        this.eng.gameManager.data.player.position = null;

        // load the new level
        this.eng.pushNewLevel(levelData);
        //TODO fade in
      });
      //TODO fad out

      player.canWalk = true;
    }
  }

  constructor(eng: Engine, spriteController: SpritBatchController, args: ITileCreateionArgs) {
    super(eng, spriteController, args);
  }
}
