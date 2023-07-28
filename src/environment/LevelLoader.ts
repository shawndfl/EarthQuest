import { TileComponent } from '../components/TileComponent';
import { TileFactory } from '../systems/TileFactory';
import { ILevelData } from './ILevelData';

export class LevelLoader {
  createLevel(levelData: ILevelData): TileComponent[][][] {
    const tileComponent: TileComponent[][][] = [[[]]];
    for (let k = 0; k < levelData.cells.length; k++) {
      for (let j = 0; j < levelData.cells[k].length; j++) {
        for (let i = 0; i < levelData.cells[k][j].length; i++) {
          //const tile =
        }
      }
    }
    return tileComponent;
  }
}
