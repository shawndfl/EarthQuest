import { Engine } from '../../core/Engine';
import { SceneComponent } from '../../components/SceneComponent';
import { InputState } from '../../core/InputHandler';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class BattleScene extends SceneComponent {
  get type(): string {
    return this.constructor.name;
  }

  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(eng: Engine) {
    super(eng);
  }

  loadLevel() {
    this.eng.dialogManager.showDialog({
      x: 20,
      y: 400,
      text: '',
      width: 300,
      height: 180,
      onClosing: (dialog) => {
        if (dialog.selectedOption == 'Attack') {
          this.pickTarget();
        } else if (dialog.selectedOption == 'Run Away') {
          // go back to the level
          this.eng.popLevel();
        }

        return false;
      },
      choices: ['Attack', 'Items', 'Run Away'],
    });
  }

  pickTarget(): void {
    this.eng.dialogManager.showDialog({
      x: 150,
      y: 120,
      text: 'Enemy1 or enemy 2',
      width: 400,
      height: 200,
      onClosing: (dialog) => {
        if (dialog.selectedOption == 'Attack') {
          console.debug('attacking!!');
          return false;
        } else {
        }

        return true;
      },
      choices: ['Attack', 'Run Away'],
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

  resize(width: number, height: number) {}
}
