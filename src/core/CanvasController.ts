import { Component } from '../components/Component';
import { Engine } from './Engine';

/**
 * This controller manages the canvas
 */
export class CanvasController extends Component {
  private _glContext: WebGL2RenderingContext;
  private _container: HTMLElement;
  private _canvasGL: HTMLCanvasElement;
  private _canvas2D: HTMLCanvasElement;

  get canvasGL(): HTMLCanvasElement {
    return this._canvasGL;
  }

  get canvas2D(): HTMLCanvasElement {
    return this._canvas2D;
  }

  get gl() {
    return this._glContext;
  }

  constructor(eng: Engine) {
    super(eng);
    this._container = document.createElement('div');
    this._container.classList.add('canvas-container');

    this._canvasGL = document.createElement('canvas');
    this._canvasGL.width = 800;
    this._canvasGL.height = 600;
    this._canvasGL.classList.add('this._canvas');

    this._canvas2D = document.createElement('canvas');
    this._canvas2D.style.display = 'none';
    this._canvas2D.style.width = '800px';
    this._canvas2D.style.height = '600px';
    this._canvas2D.width = 800;
    this._canvas2D.height = 600;
    this._canvas2D.classList.add('this._canvas');

    this._container.append(this._canvasGL, this._canvas2D);

    window.addEventListener('resize', (e) => {
      this.eng.resize(this._canvasGL.width, this._canvasGL.height);
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
      return;
    }
  }

  initialize(rootElement: HTMLElement) {
    rootElement.append(this._container);
  }

  showCanvas(show: boolean): void {
    if (!show) {
      this._container.classList.add('background');
    } else {
      this._container.classList.remove('background');
    }
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
