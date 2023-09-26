
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { WorldScene } from './scenes/WorldScene';
import { ISceneFactory } from '../systems/ISceneFactory';
import { EditorScene } from './scenes/EditorScene';

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
      console.error('must provide a type for the scene');
      return null;
    } else if (type.includes('world')) {
      return new WorldScene(this.eng);
    } else if (type.startsWith('editor')) {
      return new EditorScene(this.eng);
    } else {
      console.error('unknown scene type ' + type);
      return null;
    }
  }
}
