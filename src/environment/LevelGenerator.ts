import { Component } from '../components/Component';
import { TileComponent } from '../components/TileComponent';
import { EmptyTileId } from '../core/EmptyTileId';
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

/**
 * This class is used to generate levels
 */
export class LevelGenerator extends Component {
  private _levelState: LevelGeneratorState;
  private _creationParams: LevelConstructionParams;
  private _random: Random;
  protected _tiles: TileComponent[][][];
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
   * Simple level generator
   * @param opt
   * @returns
   */
  Generate(param: LevelConstructionParams): TileComponent[][][] {
    this._creationParams = param;
    this._random = new Random(this._creationParams.seed);

    // allocate empty scene
    this.createEmpty();

    // position the character
    const characterPos = this.getRandomPoint();
    const player = this._tileFactory.createStaticTile('player|', characterPos.x, characterPos.y, 1);
    this._tiles[1][characterPos.y][characterPos.x] = player;

    const timer = new Timer();
    console.debug('creation params', param);
    const tiles = this._tiles;

    this.generateGround();

    const npcPos = this.getRandomPoint();
    const npc = this._tileFactory.createStaticTile('npc|poo', npcPos.x, npcPos.y, 1);
    this._tiles[1][npcPos.y][npcPos.x] = npc;
    console.debug('poos position ' + npcPos.toString());

    this.generateLevel1();

    console.debug('built level in ' + timer.elapsed.toFixed(2) + 'ms');
    return tiles;
  }

  placePlayer() {}

  /**
   * Create an empty world
   */
  createEmpty() {
    const param = this._creationParams;
    const tiles = this._tiles;

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
    for (let k = opt.startK; k < opt.height && k < tiles.length; k++) {
      if (k >= tiles.length || k < 0) {
        return false;
      }
      for (let j = opt.startJ; j < opt.length; j++) {
        if (j >= tiles[k].length || j < 0) {
          return false;
        }
        for (let i = opt.startI; i < opt.width; i++) {
          if (i < tiles[k][j].length || i < 0) {
            return false;
          }
          if (!tiles[k][j][i].empty) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Create ground
   */
  generateGround() {
    const tiles = this._tiles;
    const groundIndex = 0;

    const param = this._creationParams;

    for (let j = 0; j < param.length; j++) {
      for (let i = 0; i < param.width; i++) {
        const option = Math.floor(this.ran * 50);

        // get the type and sprite id
        let tileTypeAndSprite;

        tileTypeAndSprite = this.getFloorTile();
        const newTile = this._tileFactory.createStaticTile(tileTypeAndSprite, i, j, groundIndex);
        // add the new tile
        tiles[groundIndex][j][i] = newTile;
      }
    }
  }

  generateLevel1() {
    const tiles = this._tiles;
    const baseLevel = 1;

    const param = this._creationParams;

    for (let j = 0; j < param.length; j += 5) {
      for (let i = 0; i < param.width; i += 5) {
        const option = Math.floor(this.ran * 100);

        let tileTypeAndSprite = EmptyTileId;
        if (option > 60 && option < 80) {
          if (this.HasSpace({ startI: i - 5, startJ: j - 5, startK: 1, width: 10, height: 2, length: 10 })) {
            tileTypeAndSprite = this.getCollision();
          }
        } else if (option >= 80) {
          if (this.HasSpace({ startI: i - 5, startJ: j - 5, startK: 1, width: 10, height: 2, length: 10 })) {
            tileTypeAndSprite = this.getCoin();
          }
        }
        const newTile = this._tileFactory.createStaticTile(tileTypeAndSprite, i, j, baseLevel);
        // add the new tile
        if (tiles[baseLevel][j][i].empty) {
          tiles[baseLevel][j][i] = newTile;
        }
      }
    }
  }

  /**
   * Get a random position for the character
   * @returns
   */
  getRandomPoint(): vec2 {
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
    const option = Math.floor(this.ran * 50);
    if (option == 2) {
      return 'open|block.grass.dirt';
    } else if (option == 3) {
      return 'open|block.grass.patch';
    } else {
      return 'open|block.grass';
    }
  }

  getCoin() {
    return 'gold|coin.1';
  }
  getCollision() {
    return 'collide|tree';
  }
}
