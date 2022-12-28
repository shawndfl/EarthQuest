import { WebGLDebugUtils } from '../utilities/webgl-debug';

/**
 * This controller manages the canvas
 */
export class CanvasController {
  constructor() {
    /** @type {HTMLElement} Canvas element */
    this.canvas = document.createElement('canvas');

    this.canvas.setAttribute('width', '800px');
    this.canvas.setAttribute('height', '500px');
    this.canvas.classList.add('canvas');

    /** @type {WebGL2RenderingContext} render context from this canvas*/
    this.gl = this.canvas.getContext('webgl2');

    // Only continue if WebGL is available and working
    if (this.gl === null) {
      console.error(
        'Unable to initialize WebGL2. Your browser or machine may not support it.'
      );
      return;
    }
  }

  /**
   * Get the canvas component
   * @returns
   */
  component() {
    return this.canvas;
  }
}
