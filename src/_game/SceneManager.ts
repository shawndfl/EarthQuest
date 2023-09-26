import { Engine } from '../core/Engine';
import { ISceneFactory } from '../systems/ISceneFactory';
import { SceneManager } from '../systems/SceneManager';
import { SceneFactory } from './SceneFactory';

/**
 * Manages the active scene and switching from scene to scene. 
 */
export class EarthQuestSceneManager extends SceneManager {

  constructor(eng: Engine) {
    super(eng);

  }

  createSceneFactory(): ISceneFactory {
    return new SceneFactory(this.eng);
  }
}
