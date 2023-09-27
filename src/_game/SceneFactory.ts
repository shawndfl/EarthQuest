
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { WorldScene } from './scenes/WorldScene';
import { ISceneFactory } from '../systems/ISceneFactory';
import { EditorScene } from './scenes/EditorScene';
import { DefautlScene } from '../scenes/DefaultScene';

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
      return new DefautlScene(this.eng);
    } else if (type == 'world') {
      return new WorldScene(this.eng);
    } else if (type == 'editor') {
      return new EditorScene(this.eng);
    } else {
      console.error('Unknown scene type ' + type);
      return new DefautlScene(this.eng);
    }
  }
}
