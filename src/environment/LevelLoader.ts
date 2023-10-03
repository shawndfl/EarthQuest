import { Component } from '../components/Component';
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
  load(levelData: ILevelData, tileFactory: TileFactory): TileComponent[][][] {
    const tileComponent: TileComponent[][][] = [[[]]];

    const uuid = this.eng.random.getUuid();
    console.debug('uuid ' + uuid);

    for (let k = 0; k < levelData.encode.length; k++) {
      tileComponent.push([]);
      for (let j = 0; j < levelData.encode[k].length; j++) {
        tileComponent[k].push([]);

        const row = levelData.encode[k][j];
        let i = 0;
        for (let s = 0; s < row.length; s += 2) {
          const element = row[s] + row[s + 1];
          const index = parseInt(element, 16);
          const type = levelData.tiles[index];
          const tile = tileFactory.createStaticTile(type, i++, j, k);
          tileComponent[k][j].push(tile);
        }
      }
    }
    return tileComponent;
  }
}
