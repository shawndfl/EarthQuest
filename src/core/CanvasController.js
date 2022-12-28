/**
 * This controller manages the canvas
 */
export class CanvasController {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', '800px');
    this.canvas.setAttribute('height', '500px');
    this.canvas.classList.add('canvas');

    // Initialize the GL context
    this.gl = this.canvas.getContext('webgl');

    // Only continue if WebGL is available and working
    if (this.gl === null) {
      alert(
        'Unable to initialize WebGL. Your browser or machine may not support it.'
      );
      return;
    }

    // Set clear color to black, fully opaque
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  /**
   * Get the canvas component
   * @returns
   */
  component() {
    return this.canvas;
  }
}
