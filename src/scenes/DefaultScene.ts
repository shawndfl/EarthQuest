import { Texture } from '../graphics/Texture';
import { GroundManager } from '../systems/GroundManager';
import { PlayerController } from '../components/PlayerController';
import { Engine } from '../core/Engine';
import { DialogMenu } from '../menus/DialogMenu';
import { SceneComponent } from '../components/SceneComponent';
import { ILevelData } from '../environment/ILevelData';
import { InputState } from '../core/InputHandler';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class DefaultScene extends SceneComponent {
  private _spriteSheetTexture: Texture;

  get spriteSheetTexture(): Texture {
    return this._spriteSheetTexture;
  }

  get type(): string {
    return typeof this;
  }

  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(eng: Engine) {
    super(eng);
  }

  async loadLevel(): Promise<void> {
    this.eng.dialogManager.showDialog({
      text: 'Welcome to Earth Quest!\nThis is a default scene for the engine',
      x: 20,
      y: 40,
      width: 600,
      height: 240,
    });
  }

  /**
   * Handles user input. The logic goes through a chain of commands
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    return false;
  }

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {
    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
