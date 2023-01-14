import { Scene } from '../components/Scene';
import { Editor } from '../editor/Editor';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { InputHandler } from './InputHandler';
import { TileHelper } from '../utilities/TileHelper';
import { UserAction } from './UserAction';
import { SoundManager } from '../systems/SoundManager';
import { ViewManager } from '../systems/ViewManager';
import { MenuManager } from '../systems/MenuManager';
import { TextManager } from '../systems/TextManager';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';

/**
 * This is the game engine class that ties all the sub systems together. Including
 * the scene, sound manager, and game play, etc.
 */
export class Engine {
  readonly scene: Scene;
  readonly input: InputHandler;
  private _editor: Editor;
  readonly spritePerspectiveShader: SpritePerspectiveShader;
  readonly tileHelper: TileHelper;
  readonly soundManager: SoundManager;
  readonly viewManager: ViewManager;
  readonly textManager: TextManager;
  readonly menuManager: MenuManager;

  /**
   * Tile scale for the game
   */
  get tileScale(): number {
    return 2;
  }

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
    this.tileHelper = new TileHelper(this);
    this.soundManager = new SoundManager();
    this.viewManager = new ViewManager(this);
    this.menuManager = new MenuManager(this);
    this.textManager = new TextManager(this);
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
    // Browsers copy pixels from the loaded image in top-to-bottom order —
    // from the top-left corner; but WebGL wants the pixels in bottom-to-top
    // order — starting from the bottom-left corner. So in order to prevent
    // the resulting image texture from having the wrong orientation when
    // rendered, we need to make the following call, to cause the pixels to
    // be flipped into the bottom-to-top order that WebGL expects.
    // See jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down
    // NOTE, this must be done before any textures are loaded
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    await this.textManager.initialize(FontImage, FontData);
    await this.scene.initialize();
    await this.menuManager.initialize();
  }

  update(dt: number) {
    // handle gamepad polling
    this.input.preUpdate(dt);

    // handle input
    if (this.input.action != UserAction.None) {
      this.soundManager.UserReady();
      this.scene.handleUserAction(this.input.action);
    }

    // update most of the game components
    this.scene.update(dt);

    // update the menu manager
    this.menuManager.update(dt);

    // update text manager
    this.textManager.update(dt);

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
