import { Scene } from '../components/Scene';
import { TextManager } from '../systems/TextManager';

/**
 * This is the game engine class that ties all the sub systems together. Including
 * the scene, sound manager, and game play, etc.
 */
export class Engine {
  readonly scene: Scene;

  constructor(readonly gl: WebGL2RenderingContext) {
    this.scene = new Scene(this);
  }

  async initialize() {
    await this.scene.initialize();
  }

  update(dt: number) {
    this.scene.update(dt);
  }

  resize(width: number, height: number) {
    this.scene.resize(width, height);
  }

  dispose() {
    this.scene.dispose();
  }
}
