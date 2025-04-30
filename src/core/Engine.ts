import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { InputHandler } from './InputHandler';
import { TileHelper } from '../utilities/TileHelper';
import { UserAction } from './UserAction';
import { SoundManager } from '../systems/SoundManager';
import { ViewManager } from '../systems/ViewManager';
import { DialogManager } from '../systems/DialogManager';
import { TextManager } from '../systems/TextManager';
import { SceneComponent } from '../components/SceneComponent';

import { FpsController } from './FpsController';
import { Random } from '../utilities/Random';
import { AssetManager } from '../systems/AssetManager';
import { GameManager } from '../systems/GameManager';
import { CanvasController } from './CanvasController';
import { ILevelData } from '../environment/ILevelData';
import { SceneManager } from '../systems/SceneManager';

import { Editor } from '../editor/Editor';
import { NotificationManager } from './NotificationManager';
import { BattleManager } from '../systems/BattleManager';
import { LevelRequest } from './ILevelRequest';

/**
 * This is the game engine class that ties all the sub systems together. Including
 * the scene, sound manager, and game play, etc.
 */
export class Engine {
  readonly input: InputHandler;
  readonly spritePerspectiveShader: SpritePerspectiveShader;
  readonly tileHelper: TileHelper;
  readonly soundManager: SoundManager;
  readonly viewManager: ViewManager;
  readonly textManager: TextManager;
  readonly dialogManager: DialogManager;
  readonly gameManager: GameManager;
  readonly fps: FpsController;
  readonly random: Random;
  readonly assetManager: AssetManager;
  readonly rootElement: HTMLElement;
  readonly canvasController: CanvasController;
  readonly sceneManager: SceneManager;
  readonly editor: Editor;
  readonly notificationManager: NotificationManager;
  readonly battleManager: BattleManager;

  /**
   * the render context
   */
  get gl(): WebGL2RenderingContext {
    return this.canvasController.gl;
  }

  /**
   * Is the game paused.
   */
  get pause(): boolean {
    return this.dialogManager.gameMenu.visible;
  }

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

  get scene(): SceneComponent {
    return this.sceneManager.scene;
  }

  constructor() {
    // create the canvas with the gl context so everything downstream can now use it
    this.canvasController = new CanvasController(this);

    this.random = new Random(1001);
    this.assetManager = new AssetManager(this);
    this.gameManager = new GameManager(this);
    this.sceneManager = this.createSceneManager();
    this.input = new InputHandler(this);
    this.tileHelper = new TileHelper();
    this.soundManager = new SoundManager();
    this.viewManager = new ViewManager(this);
    this.dialogManager = new DialogManager(this);
    this.textManager = new TextManager(this);
    this.fps = new FpsController(this);
    this.notificationManager = new NotificationManager(this);
    this.editor = new Editor(this);
    this.spritePerspectiveShader = new SpritePerspectiveShader(this.gl, 'spritePerspectiveShader');
    this.battleManager = new BattleManager(this);

    this.notificationManager.subscribe('EditorClose', (data: any) => {
      this.editor.hide();
    });
  }

  /**
   * This should just switch between the battle and the active level
   */
  public endBattle(): void {
    this.sceneManager.endBattle();
    this.gameManager.endBattle();
    this.assetManager.endBattle();
    this.textManager.endBattle();
    this.dialogManager.endBattle();
    this.battleManager.endBattle();
  }

  createSceneManager(): SceneManager {
    return new SceneManager(this);
  }

  /**
   * Async loads a battle given level data. This should be called through LevelLoaderManager
   * @param level
   */
  async loadBattle(level: ILevelData): Promise<void> {
    // load all the managers
    await this.sceneManager.loadBattle(level);
    await this.gameManager.loadBattle(level);
    await this.assetManager.loadBattle(level);
    await this.textManager.loadBattle(level);
    await this.dialogManager.loadBattle(level);
    await this.battleManager.loadBattle(level);
  }

  /**
   * Loads a new level. This will update each system with the
   * new level. This function makes sure all systems are in sync
   * and each system can perform its own state management as needed.
   * @param level
   */
  async loadLevel(level: ILevelData): Promise<void> {
    // close anything that is open
    this.closeLevel();

    // load all the managers
    await this.sceneManager.loadLevel(level);
    await this.gameManager.loadLevel(level);
    await this.assetManager.loadLevel(level);
    await this.textManager.loadLevel(level);
    await this.dialogManager.loadLevel(level);
    await this.battleManager.loadLevel(level);
  }

  private closeLevel(): void {
    this.battleManager.closeLevel();
    this.gameManager.closeLevel();
    this.assetManager.closeLevel();
    this.textManager.closeLevel();
    this.dialogManager.closeLevel();
    this.sceneManager.closeLevel();
  }

  async initialize(rootElement: HTMLElement) {
    this.canvasController.initialize(rootElement);

    // Browsers copy pixels from the loaded image in top-to-bottom order —
    // from the top-left corner; but WebGL wants the pixels in bottom-to-top
    // order — starting from the bottom-left corner. So in order to prevent
    // the resulting image texture from having the wrong orientation when
    // rendered, we need to make the following call, to cause the pixels to
    // be flipped into the bottom-to-top order that WebGL expects.
    // See jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down
    // NOTE, this must be done before any textures are loaded
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.tileHelper.calculateTransform(this.width, this.height);
    await this.assetManager.initialize();
    await this.gameManager.initialize();
    await this.textManager.initialize();
    await this.dialogManager.initialize();
    await this.editor.initialize(rootElement);
    await this.battleManager.initialize();

    // this will load the first level
    await this.sceneManager.initialize();

    // some gl setup
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    this.gl.enable(this.gl.BLEND);

    this.gl.clearColor(0.3, 0.3, 0.3, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything

    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ZERO);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things
  }

  /**
   * Show the editor
   * @param levelData
   */
  showEditor(levelData?: ILevelData) {
    if (!levelData) {
      this.editor.show(this.sceneManager.levelData);
    } else {
      this.editor.show(levelData);
    }
    this.canvasController.showCanvas(false);
  }

  /**
   * Hide the editor
   */
  hideEditor() {
    this.editor.hide();
    this.canvasController.showCanvas(true);
    // the level will be loaded next frame
    this.sceneManager.requestNewLevel({ requestType: LevelRequest.levelData, levelData: this.editor.levelData });
  }

  onlyFps(dt: number) {
    // update the fps
    this.fps.update(dt);
    // Clear the canvas before we start drawing on it.
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // update text manager
    this.textManager.update(dt);
  }

  update(dt: number) {
    // only the editor will be updated
    if (this.editor.isActive) {
      // update the editor
      this.editor.update(dt);
    }
    // just playing the game
    else {
      // update the active scene, battle scene, and handle scene loading
      this.sceneManager.update(dt);

      // skip some frames
      if (!this.sceneManager.isLevelReady) {
        //TODO show some kind of loading screen
        return;
      }

      // update the fps
      this.fps.update(dt);

      // handle gamepad polling
      this.input.preUpdate(dt);

      // handle input
      if (this.input.buttonsDown != UserAction.None || this.input.buttonsReleased != UserAction.None) {
        this.soundManager.UserReady();
        const inputState = this.input.getInputState();
        // handle dialog input first
        this.dialogManager.handleUserAction(inputState) ||
          this.scene.handleUserAction(inputState) ||
          this.scene?.ground.worldPlayer?.handleUserAction(inputState);
      }

      // update time for game manager
      this.gameManager.update(dt);

      // update the battle scene
      this.battleManager.update(dt);

      // update the menu manager
      this.dialogManager.update(dt);

      // update text manager
      this.textManager.update(dt);

      // used to reset flags and update hold timers
      this.input.postUpdate(dt);
    }
  }

  resize(width: number, height: number) {
    this.scene.resize(width, height);
  }

  dispose() {
    this.scene.dispose();
  }
}
