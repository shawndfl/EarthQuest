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
  id: string; /// The index of the type
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
   * Create static tiles
   * @param type
   * @param i
   * @param j
   * @param k
   * @returns
   */
  createStaticTile(tile: ITileTypeData, i: number, j: number, k: number): TileComponent {
    if (!tile) {
      return new EmptyTile(this.eng, this.groundManager, i, j, k);
    }

    const args: ITileCreationArgs = {
      i,
      j,
      k,
      groundManager: this.groundManager,
      type: tile.tileType,
      sprite: tile.spriteId,
      flags: tile.flags,
    };
    const tileType = tile.tileType;
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
      console.error("Unknown tile type '" + tile.tileType + "' @ (" + i + ', ' + j + ', ' + k + ')');
      return new EmptyTile(this.eng, this.groundManager, i, j, k);
    }
  }

  /**Clear all sprites */
  clearSpriteBatch() {
    this.spriteBatch.clearAllSprites();
  }
}
