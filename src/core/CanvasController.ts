

/**
 * This controller manages the canvas
 */
export class CanvasController {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;

  constructor() {
    /** @type {HTMLCanvasElement} Canvas element */
    this.canvas = document.createElement('canvas');

    this.canvas.setAttribute('width', '800px');
    this.canvas.setAttribute('height', '500px');
    this.canvas.classList.add('canvas');

    /** @type {WebGL2RenderingContext} render context from this canvas*/
    // @ts-ignore
    this.gl = (WebGLDebugUtils as any).makeDebugContext(
      this.canvas.getContext('webgl2'),
      undefined,
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

  /**
   * Get the canvas component
   * @returns
   */
  component() {
    return this.canvas;
  }
}
