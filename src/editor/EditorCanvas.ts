import '../css/EditorCanvas.scss';
import vec2 from '../math/vec2';
import { CanvasRenderer } from './CanvasRenderer';
import { EditorComponent } from './EditorComponent';
import { IEditor } from './IEditor';

/**
 * Manages the editor canvas event handling
 */
export class EditorCanvas extends EditorComponent {
  canvas: HTMLCanvasElement;
  canvasRenderer: CanvasRenderer;
  scaleStep: number;
  isPanning: boolean;
  lastPos: vec2;
  readonly width: number = 800;
  readonly height: number = 600;

  get context(): CanvasRenderingContext2D {
    return this.canvasRenderer.context;
  }

  constructor(editor: IEditor) {
    super(editor);
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    this.canvasRenderer = new CanvasRenderer(this.editor, context);
  }

  buildHtml(): HTMLCanvasElement {
    this.canvas.classList.add('editor-canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.isPanning = false;

    this.scaleStep = 20;

    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.mouseDown(e);
    });
    this.canvas.addEventListener('mouseleave', (e: MouseEvent) => {
      this.mouseExit(e);
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

  mouseDown(e: MouseEvent) {}

  mouseExit(e: MouseEvent) {
    this.lastPos = undefined;
    console.debug('down', e);
  }

  mouseUp(e: MouseEvent) {
    console.debug('up', e);
    var rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width; // relationship bitmap vs. element for x
    const scaleY = this.canvas.height / rect.height; // relationship bitmap vs. element for y

    const point = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };

    this.canvasRenderer.select(point.x, point.y);
    this.lastPos = undefined;
  }

  mouseWheel(e: WheelEvent) {
    const scale = this.canvasRenderer.scale + 2.0 / (e.deltaY > 0 ? -this.scaleStep : this.scaleStep);
    this.zoom(scale);
  }

  zoom(scale: number): void {
    this.canvasRenderer.setScale(scale);
  }

  mouseMove(e: MouseEvent) {
    // right click
    if (e.buttons == 1) {
      const scale = 0.5;
      if (!this.lastPos) {
        this.lastPos = new vec2(e.offsetX, e.offsetY);
      }
      const delta = new vec2(e.offsetX, e.offsetY).subtract(this.lastPos);
      const offset = this.canvasRenderer.offset.add(delta.scale(scale));
      console.debug('delta ' + delta + ' offset ' + offset);
      this.canvasRenderer.setOffset(offset);
      this.lastPos.x = e.offsetX;
      this.lastPos.y = e.offsetY;
    }
  }

  render() {
    this.canvasRenderer.render();
  }
}
