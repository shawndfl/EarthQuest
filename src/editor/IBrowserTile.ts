import { ISpriteDataAndImage } from '../systems/AssetManager';
import { ITileTypeData } from '../systems/ITileTypeData';

export interface IBrowserTile {
  tileTypeData: ITileTypeData;
  flags: string[];
  spriteData: ISpriteDataAndImage;
}
