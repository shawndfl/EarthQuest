import { Component } from '../components/Component';
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';

/**
 * Creates a scene from a type
 */
export abstract class ISceneFactory extends Component {

  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Create scene
   * @param type
   * @returns
   */
  abstract createScene(type: string): SceneComponent;
}
