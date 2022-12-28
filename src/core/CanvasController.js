/**
 * This controller manages the canvas
 */
export class CanvasController {
  /** The canvas */
  canvas;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = '800px';
    this.canvas.height = '600px';
    this.canvas.classList.add('canvas');
  }

  /**
   * Get the canvas component
   * @returns
   */
  component() {
    return this.canvas;
  }
}

/**
 * Create the only instance of a canvas controller
 */
const canvas = new CanvasController();
document.body.appendChild(canvas.component());
