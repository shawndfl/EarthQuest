import { Component } from '../components/Component';
import { PlayerController } from '../components/PlayerController';
import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import { TileFactory } from '../systems/TileFactory';
import { ILevelData } from './ILevelData';

/**
 * Loads a level and creates a 3D array of tiles
 */
export class LevelLoader extends Component {
  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Load the levels
   * @param levelData
   * @returns
   */
  load(levelData: ILevelData, tileFactory: TileFactory, tiles: TileComponent[][][]): void {
    const uuid = this.eng.random.getUuid();
    console.debug('uuid ' + uuid);

    if (!levelData.map) {
      return;
    }

    Object.keys(levelData.map).forEach((m) => {
      const [i, j, k] = m.split(',').map((i) => Number.parseInt(i));

      if (
        i === undefined ||
        j === undefined ||
        k === undefined ||
        Number.isNaN(i) ||
        Number.isNaN(j) ||
        Number.isNaN(k)
      ) {
        console.error('map keys should be in the form of <i,j,k> not: ' + m);
        return;
      }

      const tileTypeData = levelData.tiles[levelData.map[m]];
      const flagsString: string = levelData.flags?.[m];
      const flags = flagsString?.split(',') ?? [];

      if (!tileTypeData) {
        console.error('invalid index ' + i + ', ' + j + ', ' + k);
        return;
      }

      const tile = tileFactory.createStaticTile(tileTypeData, i, j, k, flags);
      if (!tiles[k]) {
        tiles[k] = [];
      }
      if (!tiles[k][j]) {
        tiles[k][j] = [];
      }
      tiles[k][j][i] = tile;
    });
  }
}
