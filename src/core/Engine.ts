import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { AssetManager } from '../systems/AssetManager';
import { GameManager } from '../systems/GameManager';
import { SoundManager } from '../systems/SoundManager';
import { ViewManager } from '../systems/ViewManager';
import { Random } from '../utilities/Random';
import { NotificationManager } from './NotificationManager';
import { Scene } from './Scene';

/**
 * This is the game engine class that ties all the sub systems together. Including
 * the scene, sound manager, and game play, etc.
 */
export class Engine {
  private _glContext: WebGL2RenderingContext;
  private _canvasGL: HTMLCanvasElement;
  readonly spritePerspectiveShader: SpritePerspectiveShader;
  readonly soundManager: SoundManager;
  readonly viewManager: ViewManager;
  readonly gameManager: GameManager;
  readonly random: Random;
  readonly assetManager: AssetManager;
  readonly rootElement: HTMLElement;
  readonly notificationManager: NotificationManager;
  readonly scene: Scene;

  get canvasGL(): HTMLCanvasElement {
    return this._canvasGL;
  }

  get height(): number {
    return this.canvasGL.height;
  }

  get width(): number {
    return this.canvasGL.width;
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
    this.scene = new Scene(this);
  }

  /**
   * Creates the canvas element and saves the gl context from it.
   * @returns
   */
  protected createCanvas(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('canvas-container');

    this._canvasGL = document.createElement('canvas');
    this._canvasGL.width = 800;
    this._canvasGL.height = 600;
    this._canvasGL.classList.add('this._canvas');

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
    this.gl.cullFace(this.gl.FRONT);

    this.gl.enable(this.gl.BLEND);

    this.gl.clearColor(0.3, 0.3, 0.3, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything

    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ZERO);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

    // initialize all systems
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
    /*
    console.log(
      'gl.' +
        functionName +
        '(' +
        // @ts-ignore
        (WebGLDebugUtils as any).glFunctionArgsToString(functionName, args) +
        ')'
    );
    */
  }
}
