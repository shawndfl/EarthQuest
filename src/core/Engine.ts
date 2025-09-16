import { AssetManager } from '../systems/AssetManager';
import { GameManager } from '../systems/GameManager';
import { SoundManager } from '../systems/SoundManager';
import { ViewManager } from '../systems/ViewManager';
import { Random } from '../utilities/Random';
import { NotificationManager } from './NotificationManager';
import '../css/canvas.scss';
import { TileManager } from '../systems/TileManager';
import { ILevelData } from '../data/ILevelData';
import { InputManager } from '../systems/InputManager';
import { OptimizeTiles } from '../systems/OptimizeTiles';
import { DebugHelpers } from '../systems/DebugHelpers';
import { TextManager } from '../systems/TextManager';
import { DialogManager } from '../systems/DialogManager';
import { SceneManager } from '../systems/SceneManager';
import { CollisionManager } from '../systems/CollisionManager';

export const CanvasWidth = 256;
export const CanvasHeight = 224;

/**
 * This is the game engine class that ties all the sub systems together. Including
 * the scene, sound manager, and game play, etc.
 */
export class Engine {
  private _glContext: WebGL2RenderingContext;
  private _canvasGL: HTMLCanvasElement;
  readonly soundManager: SoundManager;
  readonly viewManager: ViewManager;
  readonly gameManager: GameManager;
  readonly random: Random;
  readonly assetManager: AssetManager;
  readonly rootElement: HTMLElement;
  readonly notificationManager: NotificationManager;
  readonly sceneManager: SceneManager;
  readonly tileManager: TileManager;
  readonly collisionManager: CollisionManager;
  readonly inputManager: InputManager;
  readonly optimizeTiles: OptimizeTiles;
  readonly urlParams: URL;
  readonly debugHelpers: DebugHelpers;
  readonly textManager: TextManager;
  readonly dialogManager: DialogManager;

  get canvasGL(): HTMLCanvasElement {
    return this._canvasGL;
  }

  get height(): number {
    return this.canvasGL.height;
  }

  get width(): number {
    return this.canvasGL.width;
  }

  get pixelScale(): number {
    return 2;
  }

  get editorActive(): boolean {
    return !!this.urlParams.searchParams.get('editor');
  }

  /**
   * the render context
   */
  get gl() {
    return this._glContext;
  }

  /**
   * Used to create all instances of systems
   */
  constructor() {
    this.notificationManager = new NotificationManager(this);
    this.debugHelpers = new DebugHelpers(this);
    this.textManager = new TextManager(this);
    this.dialogManager = new DialogManager(this);
    this.sceneManager = new SceneManager(this);
    this.tileManager = new TileManager(this);
    this.collisionManager = new CollisionManager(this);
    this.assetManager = new AssetManager(this);
    //TODO make this configurable, maybe per level
    this.random = new Random(122344);
    this.viewManager = new ViewManager(this);
    this.inputManager = new InputManager(this);
    this.gameManager = new GameManager(this);
    this.optimizeTiles = new OptimizeTiles(this);
    this.urlParams = new URL(window.location.href);
  }

  /**
   * Creates the canvas element and saves the gl context from it.
   * @returns
   */
  protected createCanvas(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('canvas-container');

    this._canvasGL = document.createElement('canvas');
    this._canvasGL.width = CanvasWidth * this.pixelScale;
    this._canvasGL.height = CanvasHeight * this.pixelScale;
    container.append(this._canvasGL);

    window.addEventListener('resize', (e) => {
      this.resize(this._canvasGL.width, this._canvasGL.height);
    });

    if (false) {
      /** @type {WebGL2RenderingContext} render context from this canvas*/
      // @ts-ignore
      this._glContext = (WebGLDebugUtils as any).makeDebugContext(
        this._canvasGL.getContext('webgl2'),
        this.logGlError.bind(this),
        this.logGLCall.bind(this)
      );
    } else {
      this._glContext = this._canvasGL.getContext('webgl2');
    }
    // Only continue if WebGL is available and working
    if (this.gl === null) {
      console.error('Unable to initialize WebGL2. Your browser or machine may not support it.');
    }

    return container;
  }

  /**
   * Initializes the engine with all its systems and the scene
   * @param rootElement
   */
  async initialize(rootElement: HTMLElement) {
    // add canvas element to root
    rootElement.append(this.createCanvas());

    // Browsers copy pixels from the loaded image in top-to-bottom order —
    // from the top-left corner; but WebGL wants the pixels in bottom-to-top
    // order — starting from the bottom-left corner. So in order to prevent
    // the resulting image texture from having the wrong orientation when
    // rendered, we need to make the following call, to cause the pixels to
    // be flipped into the bottom-to-top order that WebGL expects.
    // See jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down
    // NOTE, this must be done before any textures are loaded
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

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

    // initialize all systems
    await this.debugHelpers.initialize();
    await this.textManager.initialize();
    await this.dialogManager.initialize();
    await this.viewManager.initialize();
    await this.assetManager.initialize();
    await this.tileManager.initialize();
    await this.sceneManager.initialize();
    if (this.editorActive) {
      await this.optimizeTiles.initialize();
    }

    const url = this.getLevelDataUrl();
    await this.loadScene(url);
  }

  getLevelDataUrl(): string {
    return 'assets/levels/tileLevel.json';
  }

  async loadScene(path: string): Promise<void> {
    console.debug('Loading level: ' + path + ' ...');

    // get the level data
    const levelData = (await this.assetManager.requestJson(path)) as ILevelData;
    if (!levelData) {
      console.error('Cannot load level from ' + path);
      return;
    }

    // close the old level
    this.debugHelpers.closeLevel();
    this.sceneManager.closeLevel();
    this.tileManager.closeLevel();
    this.assetManager.closeLevel();
    this.dialogManager.closeLevel();
    this.collisionManager.closeLevel();

    this.gameManager.setLevel(levelData);

    // load the new level
    await this.dialogManager.loadLevel();
    await this.collisionManager.loadLevel();
    await this.assetManager.loadLevel();
    await this.tileManager.loadLevel();
    await this.sceneManager.loadLevel();
  }

  update(dt: number) {
    if (this.editorActive) {
      return;
    }
    this.inputManager.preUpdate(dt);

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.sceneManager.update(dt);
    this.tileManager.update(dt);
    this.collisionManager.update(dt);
    this.dialogManager.update(dt);
    this.textManager.update(dt);

    this.debugHelpers.update(dt);

    this.inputManager.postUpdate(dt);
  }

  resize(width: number, height: number) {
    this.sceneManager.resize(width, height);
  }

  dispose() {
    this.sceneManager.dispose();
  }

  logGlError(error: string, functionName: string, args: any) {
    console.error(
      'GL error: ' +
        error +
        ' in gl.' +
        functionName +
        '(' +
        // @ts-ignore
        (WebGLDebugUtils as any).glFunctionArgsToString(functionName, args) +
        ')'
    );
  }

  logGLCall(functionName: string, args: any) {
    console.log(
      'gl.' +
        functionName +
        '(' +
        // @ts-ignore
        (WebGLDebugUtils as any).glFunctionArgsToString(functionName, args) +
        ')'
    );
  }
}
