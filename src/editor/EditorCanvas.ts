import '../css/EditorCanvas.scss';
import { CanvasRenderer } from './CanvasRenderer';

export class EditorCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  canvasRenderer: CanvasRenderer;

  buildHtml(): HTMLCanvasElement {
    this.canvasRenderer = new CanvasRenderer();
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('editor-canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    return this.canvas;
  }

  render() {
    this.canvasRenderer.render(this.context);
  }
}
