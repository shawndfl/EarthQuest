import { Component } from '../components/Component';
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { BattleScene } from '../scenes/BattleScene';
import { WorldScene } from '../scenes/WorldScene';

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
      console.error('must provide a type for the scene');
      return null;
    } else if (type.includes('world')) {
      return new WorldScene(this.eng);
    } else if (type.startsWith('battle')) {
      return new BattleScene(this.eng);
    } else {
      console.error('unknown scene type ' + type);
      return null;
    }
  }
}
