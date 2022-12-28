/**
 * This controller manages the canvas
 */
export class CanvasController {
  container: HTMLElement;
  gl: WebGL2RenderingContext;

  constructor(onResize: (width: number, height: number) => void) {
    console.debug('starting...');
    this.container = document.createElement('div');
    this.container.classList.add('canvas-container');

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.classList.add('canvas');

    this.container.append(canvas);

    window.addEventListener('resize', (e) => {
      if (onResize) {
        onResize(canvas.clientWidth, canvas.clientHeight);
      }
    });

    /** @type {WebGL2RenderingContext} render context from this canvas*/
    // @ts-ignore
    this.gl = (WebGLDebugUtils as any).makeDebugContext(
      canvas.getContext('webgl2'),
      this.logGlError.bind(this),
      this.logGLCall.bind(this)
    );

    // Only continue if WebGL is available and working
    if (this.gl === null) {
      console.error(
        'Unable to initialize WebGL2. Your browser or machine may not support it.'
      );
      return;
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

  /**
   * Get the container element
   * @returns
   */
  element() {
    return this.container;
  }
}
