import { Component } from '../components/Component';
import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import vec2 from '../math/vec2';
import { TileFactory } from '../systems/TileFactory';
import { Random } from '../utilities/Random';
import { Timer } from '../utilities/Timer';

export class LevelConstructionParams {
  /** seed for generating the level */
  seed: number;

  /** size of the level */
  width: number;
  length: number;
  height: number;

  maxItems?: number;

  maxEnemies?: number;
}

export class LevelGeneratorState {
  /** current i,j,k cell locations */
  i: number;
  j: number;
  k: number;

  /** was the player placed */
  playerPlaced: boolean;

  itemCount: number;

  houseCount: number;
}

export class LevelGenerator extends Component {
  private _levelState: LevelGeneratorState;
  private _creationParams: LevelConstructionParams;
  private _random: Random;

  /**
   * Get the next random number
   */
  get ran() {
    return this._random.rand();
  }

  constructor(eng: Engine, protected _tileFactory: TileFactory) {
    super(eng);
  }

  /**
   * Simple level generator
   * @param opt
   * @returns
   */
  Generate(param: LevelConstructionParams): TileComponent[][][] {
    this._creationParams = param;
    this._random = new Random(this._creationParams.seed);

    const tiles: TileComponent[][][] = [[[]]];

    const characterPos = this.getCharacterPosition();

    const timer = new Timer();
    console.debug('creation params', param);
    //return [[[]]];
    // k is the height layer of the level
    for (let k = 0; k < param.height; k++) {
      // j is the columns that run from top right to bottom left

      tiles.push([]);
      for (let j = 0; j < param.length; j++) {
        // i is the rows that run from top left to bottom right
        tiles[k].push([]);
        for (let i = 0; i < param.width; i++) {
          const option = Math.floor(this.ran * 50);

          // get the type and sprite id
          let tileTypeAndSprite;
          if (k == 1) {
            if (characterPos.x == i && characterPos.y == j) {
              tileTypeAndSprite = 'player|';
            } else {
              if (option == 1) {
                tileTypeAndSprite = this.getFloorTile();
              }
            }
          } else if (k == 0) {
            if (option == 3) {
              tileTypeAndSprite = this.getCollision();
            } else {
              tileTypeAndSprite = this.getFloorTile();
            }
          } else {
          }
          const newTile = this._tileFactory.createStaticTile(tileTypeAndSprite, i, j, k);
          // add the new tile
          tiles[k][j].push(newTile);

          //TODO figure out how to register tiles that need update or other events
          //if (newTile.requiresUpdate) {
          //  this._updateTiles.push(newTile);
          // }
        }
      }
    }

    this._tileFactory.commitSpriteBatchChanges();

    console.debug('built level in ' + timer.elapsed.toFixed(2) + 'ms');
    return tiles;
  }

  /**
   * Get a random position for the character
   * @returns
   */
  getCharacterPosition(): vec2 {
    const pos = new vec2();
    const p = this._creationParams;

    pos.x = Math.floor(this.ran * p.width);
    pos.y = Math.floor(this.ran * p.length);

    return pos;
  }

  /**
   * get a floor tile
   * @returns
   */
  getFloorTile() {
    return 'open|block';
  }

  getCollision() {
    return 'collide|tree';
  }
}
