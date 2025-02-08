import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { WorldScene } from './scenes/WorldScene';
import { ISceneFactory } from '../systems/ISceneFactory';
import { DefaultScene } from '../scenes/DefaultScene';
import { BattleScene } from './scenes/BattleScene';

/**
 * Creates a scene from a type
 */
export class SceneFactory extends ISceneFactory {
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
    } else {
      console.error('Unknown scene type ' + type);
      return new DefaultScene(this.eng);
    }
  }
}
