import { Component } from '../components/Component';
import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import { TileFactory } from '../systems/TileFactory';
import { ILevelData } from './ILevelData';

/**
 * Loads a level and creates a 3D array of tiles
 */
export class LevelLoader extends Component {
  constructor(eng: Engine, protected _tileFactory: TileFactory) {
    super(eng);
  }

  /**
   * Load the levels
   * @param levelData 
   * @returns 
   */
  load(levelData: ILevelData): TileComponent[][][] {
    const tileComponent: TileComponent[][][] = [[[]]];

    const uuid = this.eng.random.getUuid();
    console.debug('uuid ' + uuid);

    for (let k = 0; k < levelData.cells.length; k++) {
      tileComponent.push([]);
      for (let j = 0; j < levelData.cells[k].length; j++) {
        tileComponent[k].push([]);
        for (let i = 0; i < levelData.cells[k][j].length; i++) {
          const typeIndex = levelData.cells[k][j][i];
          const type = levelData.tiles[typeIndex - 10];
          const tile = this._tileFactory.createStaticTile(type, i, j, k);
          tileComponent[k][j].push(tile);
        }
      }
    }
    return tileComponent;
  }
}