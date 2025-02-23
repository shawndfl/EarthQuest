import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';

/**
 * A component is something that is part of the game engine and has a reference
 * to the game engine and all the subsystems like text managers, collision and raise events.
 */
export class Component {
  /**
   * Give components easier access to gl
   */
  get gl(): WebGL2RenderingContext {
    return this.eng.gl;
  }

  constructor(readonly eng: Engine) {}

  /**
   * Called only once after all systems are created
   * Each derived calls can have a different set of parameters
   */
  /*
  async initialize(...): Promise<void> {

  }
  */

  /**
   * Loads a new level
   * @param level
   */
  async loadLevel(level: ILevelData): Promise<void> {}

  /**
   * Loads a battle scene
   * @param level
   */
  async loadBattle(level: ILevelData): Promise<void> {}

  /**
   * Switching from the battle to the active level
   */
  endBattle(): void {}

  /**
   * When the window is resized
   */
  resize(width: number, height: number) {}

  /**
   * Called every frame
   * @param dt - delta time in ms
   */
  update(dt: number) {}

  /**
   * When a scene is closed
   */
  closeLevel() {}

  /**
   * Called once to destroy everything
   */
  dispose() {}
}
