import { Texture } from '../../graphics/Texture';
import { GroundManager } from '../../systems/GroundManager';
import { PlayerController } from '../../components/PlayerController';
import { Engine } from '../../core/Engine';
import { DialogMenu } from '../../menus/DialogMenu';
import { SceneComponent } from '../../components/SceneComponent';
import { ILevelData } from '../../environment/ILevelData';
import { InputState } from '../../core/InputHandler';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class EditorScene extends SceneComponent {

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

  /**
   * Sets up the scene
   */
  async initialize(levelData: ILevelData) {


  }

  loadLevel() {
    this.eng.dialogManager.showDialog(
      'You can now edit your levels',
      { x: 20, y: 40, width: 500, height: 240 },
      (dialog) => {

      },
      ['Walk Around', 'Edit Scene',]
    );
  }

  closeLevel(): void {

  }


  /**
   * Handles user input. The logic goes through a chain of commands
   *    1) Main menu
   *    2) pause menu
   *    3) battle menu
   *    4) dialog menu
   *    5) player in the environment
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    // handle main menu, pause menu, battles menu, dialog menu, environment
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
