import { GoldComponents } from '../components/GoldComponent';
import { CollideTileComponent } from '../components/CollideTileComponent';
import { Component } from '../components/Component';
import { EmptyTile } from '../components/EmptyTile';
import { NpcComponent } from '../components/NpcComponent';
import { OpenTileComponent } from '../components/OpenTileComponent';
import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { PortalTileComponent } from '../components/PortalTileComponent';
import { HalfStepTileComponent } from '../components/HalfStepTileComponent';
import { ITileCreateionArgs } from '../components/ITileCreationArgs';

export class TileFactory extends Component {
  /**
   * a readonly empty tile
   */
  readonly empty: EmptyTile;

  /**
   * The id for empty
   */
  readonly emptyId = 'empty';

  constructor(eng: Engine, protected spriteBatch: SpritBatchController) {
    super(eng);
    this.empty = new EmptyTile(this.eng);
  }

  /**
   * Create an ID for the tile from the initial
   * @param i
   * @param j
   * @param k
   * @returns
   */
  static createStaticID(i: number, j: number, k: number): string {
    return 'tile.' + (i ?? '_') + '.' + (j ?? '_') + '.' + (k ?? '_');
  }

  /**
   * Create static tiles
   * @param type
   * @param i
   * @param j
   * @param k
   * @returns
   */
  createStaticTile(type: string, i: number, j: number, k: number): TileComponent {

    if (!type || type == '---' || type == 'empty') {
      return new EmptyTile(this.eng, i, j, k);
    }

    const typeSpriteParams = type.split('|');

    if (typeSpriteParams.length != 3) {
      console.error('invalid tile: \'' + type + '\' @ (' + i + ', ' + j + ', ' + k + ')' +
        ' Format should be <type>|<sprite>|<options>');
      return new EmptyTile(this.eng, i, j, k);
    }

    const tileType = typeSpriteParams[0];
    const sprite = typeSpriteParams[1];
    const options = typeSpriteParams[2];
    const args: ITileCreateionArgs = {
      i, j, k, type: tileType, sprite, options
    }

    if (tileType == 'block.half') {
      return new HalfStepTileComponent(this.eng, this.spriteBatch, args);

    } else if (tileType == 'open') {
      return new OpenTileComponent(this.eng, this.spriteBatch, args);

    } else if (tileType == 'player') {
      // the player is already created. Just set his position
      const player = this.eng.scene.player;
      player.setTilePosition(i, j, k);
      return player;

    } else if (tileType == 'npc') {
      return new NpcComponent(this.eng, args);

    } else if (tileType == 'gold') {
      return new GoldComponents(this.eng, this.spriteBatch, args);

    } else if (tileType == 'collide') {
      return new CollideTileComponent(this.eng, this.spriteBatch, args);

    } else if (tileType == 'portal') {
      return new PortalTileComponent(this.eng, this.spriteBatch, args);

    } else {
      console.error('Unknown tile type \'' + type + '\' @ (' + i + ', ' + j + ', ' + k + ')');
      return new EmptyTile(this.eng, i, j, k);
    }
  }

  /**Clear all sprites */
  clearSpriteBatch() {
    this.spriteBatch.clearAllSprites();
  }
}
