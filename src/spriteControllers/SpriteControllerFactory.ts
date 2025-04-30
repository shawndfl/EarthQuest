import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpriteData } from '../environment/ILevelData2';
import { TileManager } from '../systems/TileManager';
import { PlayerController } from './PlayerController';
import { SpriteController } from './SpriteController';

export enum ComponentTypes {
  player = 'player',
  npc = 'npc',
  collision = 'collision',
}

export class SpriteControllerFactory extends Component {
  constructor(eng: Engine, protected _tileManager: TileManager) {
    super(eng);
  }
  /**
   * Create components from the meta data.
   * @param data
   * @returns
   */
  public createSpriteController(spriteData: SpriteData): SpriteController {
    const type = spriteData.type;
    switch (type) {
      case 'player':
        return new PlayerController(this.eng, this._tileManager, spriteData);
      default:
        return null;
    }
  }
}
