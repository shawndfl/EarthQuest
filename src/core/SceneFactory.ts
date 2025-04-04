import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { DefaultScene } from '../scenes/DefaultScene';
import { Component } from '../components/Component';
import { WorldScene } from '../scenes/WorldScene';
import { BattleScene } from '../scenes/BattleScene';
import { TileScene } from '../scenes/TileScene';

/**
 * Creates a scene from a type
 */
export class SceneFactory extends Component {
  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Create scene
   * @param type
   * @returns
   */
  createScene(type: string): SceneComponent {
    if (!type) {
      console.error('Must provide a type for the scene');
      return new DefaultScene(this.eng);
    } else if (type == 'world') {
      return new WorldScene(this.eng);
    } else if (type == 'battle') {
      return new BattleScene(this.eng);
    } else if (type == 'tile') {
      return new TileScene(this.eng);
    } else {
      console.error('Unknown scene type ' + type);
      return new DefaultScene(this.eng);
    }
  }
}
