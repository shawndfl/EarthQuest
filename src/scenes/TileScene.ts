import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { ILevelData } from '../environment/ILevelData';
import { TileManager, TileType } from '../systems/TileManager';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class TileScene extends SceneComponent {
  protected _tileManager: TileManager;

  get tileManager(): TileManager {
    return this._tileManager;
  }

  get type(): string {
    return this.constructor.name;
  }

  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(eng: Engine) {
    super(eng);
    this._tileManager = new TileManager(eng);
  }

  initialize(): void {
    this.tileManager.initialize();
  }

  async loadLevel(level: ILevelData): Promise<void> {
    await this.tileManager.loadLevel(level);
  }

  async loadBattle(level: ILevelData): Promise<void> {
    await this.tileManager.loadBattle(level);
  }

  /**
   * Handles user input. The logic goes through a chain of commands
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    return this.tileManager.handleUserAction(state);
  }

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {
    // Clear the canvas before we start drawing on it.
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.tileManager.update(dt);
  }

  closeLevel(): void {}

  resize(width: number, height: number) {}
}
