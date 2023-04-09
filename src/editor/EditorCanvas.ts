import '../css/EditorCanvas.scss';
import { CanvasRenderer } from './CanvasRenderer';

export class EditorCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  canvasRenderer: CanvasRenderer;
  scaleStep: number;

  buildHtml(): HTMLCanvasElement {
    this.canvasRenderer = new CanvasRenderer();
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('editor-canvas');
    this.canvas.width = 800;
    this.canvas.height = 600;
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;

    this.scaleStep = 20;

    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.mouseDown(e);
    });
    this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
      this.mouseUp(e);
    });
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      this.mouseMove(e);
    });
    this.canvas.addEventListener('wheel', (e: WheelEvent) => {
      this.mouseWheel(e);
    });

    return this.canvas;
  }

  mouseDown(e: MouseEvent) {
    console.debug('down', e);
  }
  mouseUp(e: MouseEvent) {
    console.debug('up', e);
  }
  mouseWheel(e: WheelEvent) {
    const scale = this.canvasRenderer.scale + 2.0 / (e.deltaY > 0 ? -this.scaleStep : this.scaleStep);

    this.canvasRenderer.setScale(scale);
    //console.debug('wheel', e);
    this.render();
  }
  mouseMove(e: MouseEvent) {
    // right click
    if (e.ctrlKey && e.buttons == 1) {
      console.debug('move', e);
    }
  }

  render() {
    this.canvasRenderer.render(this.context);
  }
}
