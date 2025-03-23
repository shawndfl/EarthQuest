import { Component } from '../components/Component';
import { TileComponent } from '../components/TileComponent';
import { EmptyTileId } from '../core/EmptyTileId';
import { Engine } from '../core/Engine';
import vec2 from '../math/vec2';
import { TileFactory } from '../systems/TileFactory';
import { Random } from '../utilities/Random';
import { LevelConstructionParams } from './LevelConstructionParams';
import { LevelGeneratorState } from './LevelGeneratorState';

/**
 * This class is used to generate levels
 */
export class LevelGenerator extends Component {
  private _levelState: LevelGeneratorState;
  private _creationParams: LevelConstructionParams;
  private _random: Random;
  protected _tiles: TileComponent[][][];

  /**
   * Get the state of the level generation
   */
  get levelState(): LevelGeneratorState {
    return this._levelState;
  }

  get creationParams(): LevelConstructionParams {
    return this._creationParams;
  }

  /**
   * Get the next random number
   */
  get ran() {
    return this._random.rand();
  }

  constructor(eng: Engine, protected _tileFactory: TileFactory) {
    super(eng);
    this._tiles = [[[]]];
  }

  /**
   * Create an empty world
   */
  createEmpty() {
    const param = this._creationParams;
    this._tiles = [[[]]];
    const tiles = this._tiles;

    // clear all sprites
    this._tileFactory.clearSpriteBatch();

    // clear all tiles
    for (let k = 0; k < param.height; k++) {
      tiles.push([]);
      for (let j = 0; j < param.length; j++) {
        // i is the rows that run from top left to bottom right
        tiles[k].push([]);

        for (let i = 0; i < param.width; i++) {
          tiles[k][j].push(this._tileFactory.empty);
        }
      }
    }
  }

  /**
   * Check if there is space at the location and size
   * @param opt
   * @returns
   */
  HasSpace(opt: {
    startI: number;
    startJ: number;
    startK: number;
    width: number;
    length: number;
    height: number;
  }): boolean {
    const tiles = this._tiles;
    for (let k = opt.startK; k < opt.startK + opt.height && k < tiles.length; k++) {
      // check range
      if (k >= tiles.length || k < 0) {
        return false;
      }
      for (let j = opt.startJ; j < opt.startJ + opt.length; j++) {
        // check range
        if (j >= tiles[k].length || j < 0) {
          return false;
        }
        for (let i = opt.startI; i < opt.startI + opt.width; i++) {
          // check range
          if (i >= tiles[k][j].length || i < 0) {
            return false;
          }

          // finally check if the tile is empty
          if (!tiles[k][j][i].empty) {
            return false;
          }

          // check if there is something below the space we are checking
          if (opt.startK > 0 && k == opt.startK) {
            // if it's empty we don't want to put something there
            if (tiles[k - 1][j][i].empty) {
              return false;
            }

            if (i == 0) {
              console.debug('i == 0 ');
            }
          }
        }
      }
    }
    return true;
  }

  /**
   * Get a random position for the character
   * @returns
   */
  getRandomPoint(offset?: vec2, scale?: vec2): vec2 {
    const pos = new vec2();
    const p = this._creationParams;
    if (!offset) {
      offset = new vec2(0, 0);
    }
    if (!scale) {
      scale = new vec2(p.width, p.length);
    }
    pos.x = Math.floor(this.ran * scale.x + offset.x);
    pos.y = Math.floor(this.ran * scale.y + offset.y);

    return pos;
  }

  /**
   * get a floor tile
   * @returns
   */
  getFloorTile() {
    const option = Math.floor(this.ran * 50);
    if (option == 2) {
      return 'open|block.grass.dirt';
    } else if (option == 3) {
      return 'open|block.grass.patch';
    } else {
      return 'open|block.grass';
    }
  }

  getSlopTileLeft() {
    return 'block.half|slop.left';
  }
  getHalfStepTileLeft() {
    return 'block.half|block.half';
  }
  getFloorTileEdgeLeft() {
    return 'open|block.grass.edge.left';
  }
  getFloorTileEdgeRight() {
    return 'open|block.grass.edge.right';
  }
  getFloorTileEdgeBoth() {
    return 'open|block.grass.edge.both';
  }

  getPortalTile() {
    const option = Math.floor(this.ran * 50);
    if (option == 2) {
      return 'portal|block.grass.dirt|town1';
    } else if (option == 3) {
      return 'portal|block.grass.patch|town1';
    } else {
      return 'portal|block.grass|town1';
    }
  }

  getCoin() {
    return 'gold|coin.1';
  }
  getCollision() {
    return 'collide|tree';
  }
}
