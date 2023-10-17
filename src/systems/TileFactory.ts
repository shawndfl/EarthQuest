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
import { EnemyTileComponent } from '../components/EnemyTileComponent';
import { FreeTileComponent } from '../components/FreeTileComponent';

export interface ITileTypeData {
  tile: string;
  tileType: string,
  spriteId: string,
  options: string[],
  typeIndex: number;  /// The index of the type
}

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
   * Parses the tileType. This is an encoded string that is in the format of 
   * <tile type>|<sprint id>|[option1,options2,...] 
   * @param Tile
   * @returns 
   */
  static parseTile(tile: string): ITileTypeData {

    if (tile == '---') {
      tile = 'empty|empty|';
    }

    const TileData: ITileTypeData = { tile, tileType: '', spriteId: '', options: null, typeIndex: -1 }

    const typeSpriteParams = tile.split('|');

    if (typeSpriteParams.length != 3) {
      return null;
    }

    TileData.tileType = typeSpriteParams[0];
    TileData.spriteId = typeSpriteParams[1];
    TileData.options = typeSpriteParams[2].split(',');

    return TileData;
  }

  /**
   * Create static tiles
   * @param type
   * @param i
   * @param j
   * @param k
   * @returns
   */
  createStaticTile(tile: string, i: number, j: number, k: number): TileComponent {

    if (!tile || tile == '---' || tile == 'empty') {
      return new EmptyTile(this.eng, i, j, k);
    }

    const data = TileFactory.parseTile(tile);
    if (!data) {
      console.error('invalid tile: \'' + tile + '\' @ (' + i + ', ' + j + ', ' + k + ')' +
        ' Format should be <tile type>|<sprint id>|[option1,options2,...] ');
      return new EmptyTile(this.eng, i, j, k);
    }
    const tileType = data.tileType;

    const args: ITileCreateionArgs = {
      i, j, k, type: data.tileType, sprite: data.spriteId, options: data.options
    }

    if (tileType == 'block.half') {
      return new HalfStepTileComponent(this.eng, this.spriteBatch, args);

    } else if (tileType == 'open') {
      return new OpenTileComponent(this.eng, this.spriteBatch, args);

    } else if (tileType == 'free') {
      return new FreeTileComponent(this.eng, this.spriteBatch, args);

    } else if (tileType == 'player') {
      // the player is already created. Just set his position
      const player = this.eng.player;
      player.setTilePosition(i, j, k);
      return player;

    } else if (tileType == 'npc') {
      return new NpcComponent(this.eng, args);

    } else if (tileType == 'gold') {
      return new GoldComponents(this.eng, this.spriteBatch, args);

    } else if (tileType == 'collide') {
      return new CollideTileComponent(this.eng, this.spriteBatch, args);

    } else if (tileType == 'enemy') {
      return new EnemyTileComponent(this.eng, this.spriteBatch, args);

    } else if (tileType == 'portal') {
      return new PortalTileComponent(this.eng, this.spriteBatch, args);

    } else {
      console.error('Unknown tile type \'' + tile + '\' @ (' + i + ', ' + j + ', ' + k + ')');
      return new EmptyTile(this.eng, i, j, k);
    }
  }

  /**Clear all sprites */
  clearSpriteBatch() {
    this.spriteBatch.clearAllSprites();
  }
}
