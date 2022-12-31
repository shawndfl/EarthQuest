import { Scene } from '../components/Scene';
import { Editor } from '../editor/Editor';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { InputHandler } from './InputHandler';

/**
 * This is the game engine class that ties all the sub systems together. Including
 * the scene, sound manager, and game play, etc.
 */
export class Engine {
  readonly scene: Scene;
  readonly input: InputHandler;
  private _editor: Editor;
  readonly spritePerspectiveShader: SpritePerspectiveShader;

  get width(): number {
    return this.gl.canvas.width;
  }

  get height(): number {
    return this.gl.canvas.height;
  }

  get editor(): Editor {
    return this._editor;
  }

  constructor(readonly gl: WebGL2RenderingContext) {
    this.scene = new Scene(this);
    this.input = new InputHandler(this);
    this.spritePerspectiveShader = new SpritePerspectiveShader(
      this.gl,
      'spritePerspectiveShader'
    );
  }

  /**
   * Create the editor
   * @param parentContainer
   */
  createEditor(parentContainer: HTMLElement) {
    this._editor = new Editor(this, parentContainer);
  }

  async initialize() {
    await this.scene.initialize();
  }

  update(dt: number) {
    // handle gamepad polling
    this.input.preUpdate(dt);

    // handle input
    this.scene.handleUserAction(this.input.action);

    // update most of the game components
    this.scene.update(dt);

    // used to reset flags and update hold timers
    this.input.postUpdate(dt);
  }

  resize(width: number, height: number) {
    this.scene.resize(width, height);
  }

  dispose() {
    this.scene.dispose();
  }
}
