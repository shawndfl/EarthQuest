import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { DefaultScene } from '../scenes/DefaultScene';
import { ISceneFactory } from '../systems/ISceneFactory';

/**
 * Creates a scene from a type
 */
export class DefaultSceneFactory extends ISceneFactory {
  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Create scene
   * @param type
   * @returns
   */
  createScene(type: string): SceneComponent {
    return new DefaultScene(this.eng);
  }
}
