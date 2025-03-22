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
import { EnemyTileComponent } from '../components/EnemyTileComponent';
import { FreeTileComponent } from '../components/FreeTileComponent';
import { EnemyBattleTileComponent } from '../components/EnemyBattleTileComponent';
import { GroundManager } from './GroundManager';
import { ITileCreationArgs } from '../components/ITileCreationArgs';
import { PlayerBattleTileComponent } from '../components/PlayerBattleTileComponent';
import { PlayerController } from '../components/PlayerController';

export interface ITileTypeData {
  typeIndex: number; /// The index of the type
  tileType: string;
  spriteId: string;
  flags: string[];
}

export class TileFactory extends Component {
  private _player: PlayerController;
  public get player(): PlayerController {
    return this._player;
  }

  /**
   * a readonly empty tile
   */
  readonly empty: EmptyTile;

  /**
   * The id for empty
   */
  readonly emptyId = 'empty';

  constructor(eng: Engine, protected groundManager: GroundManager, protected spriteBatch: SpritBatchController) {
    super(eng);
    this.empty = new EmptyTile(this.eng, groundManager);
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

    const TileData: ITileTypeData = {
      tileType: '',
      spriteId: '',
      flags: null,
      typeIndex: -1,
    };

    const typeSpriteParams = tile.split('|');

    if (typeSpriteParams.length != 3) {
      console.error("Error parsing tile '" + tile + "'. Should be in the format of type|sprite id|[flags]");
      return null;
    }

    TileData.tileType = typeSpriteParams[0];
    TileData.spriteId = typeSpriteParams[1];
    TileData.flags = typeSpriteParams[2].split(',');

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
      return new EmptyTile(this.eng, this.groundManager, i, j, k);
    }

    const data = TileFactory.parseTile(tile);
    if (!data) {
      console.error(
        "invalid tile: '" +
          tile +
          "' @ (" +
          i +
          ', ' +
          j +
          ', ' +
          k +
          ')' +
          ' Format should be <tile type>|<sprint id>|[option1,options2,...] '
      );
      return new EmptyTile(this.eng, this.groundManager, i, j, k);
    }
    const tileType = data.tileType;

    const args: ITileCreationArgs = {
      i,
      j,
      k,
      groundManager: this.groundManager,
      type: data.tileType,
      sprite: data.spriteId,
      flags: data.flags,
    };

    if (tileType == 'block.half') {
      return new HalfStepTileComponent(this.eng, this.spriteBatch, args);
    } else if (tileType == 'open') {
      return new OpenTileComponent(this.eng, this.spriteBatch, args);
    } else if (tileType == 'free') {
      return new FreeTileComponent(this.eng, this.spriteBatch, args);
    } else if (tileType == 'player') {
      if (this._player) {
        return this._player;
      } else {
        this._player = new PlayerController(this.eng, args);
        return this._player;
      }
    } else if (tileType == 'player.battle') {
      return new PlayerBattleTileComponent(this.eng, this.spriteBatch, args);
    } else if (tileType == 'npc') {
      return new NpcComponent(this.eng, args);
    } else if (tileType == 'gold') {
      return new GoldComponents(this.eng, this.spriteBatch, args);
    } else if (tileType == 'collide') {
      return new CollideTileComponent(this.eng, this.spriteBatch, args);
    } else if (tileType == 'enemy') {
      return new EnemyTileComponent(this.eng, this.spriteBatch, args);
    } else if (tileType == 'enemy.battle') {
      return new EnemyBattleTileComponent(this.eng, this.spriteBatch, args);
    } else if (tileType == 'portal') {
      return new PortalTileComponent(this.eng, this.spriteBatch, args);
    } else {
      console.error("Unknown tile type '" + tile + "' @ (" + i + ', ' + j + ', ' + k + ')');
      return new EmptyTile(this.eng, this.groundManager, i, j, k);
    }
  }

  /**Clear all sprites */
  clearSpriteBatch() {
    this.spriteBatch.clearAllSprites();
  }
}
