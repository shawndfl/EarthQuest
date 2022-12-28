import { Scene } from '../components/Scene';
import { InputHandler } from './InputHandler';
import { UserAction } from './UserAction';

/**
 * This is the game engine class that ties all the sub systems together. Including
 * the scene, sound manager, and game play, etc.
 */
export class Engine {
  readonly scene: Scene;
  readonly input: InputHandler;

  constructor(readonly gl: WebGL2RenderingContext) {
    this.scene = new Scene(this);
    this.input = new InputHandler(this);
  }

  async initialize() {
    await this.scene.initialize();
  }

  handleUserAction(action: UserAction) {
    this.scene.handleUserAction(action);
  }

  gamepad() {
    // Always call `navigator.getGamepads()` inside of
    // the game loop, not outside.
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      // Disregard empty slots.
      if (!gamepad) {
        continue;
      }
    }
  }

  update(dt: number) {
    this.handleUserAction(this.input.action);

    this.scene.update(dt);
  }

  resize(width: number, height: number) {
    this.scene.resize(width, height);
  }

  dispose() {
    this.scene.dispose();
  }
}
