import '../css/EditorCanvas.scss';
import vec2 from '../math/vec2';
import { CanvasRenderer } from './CanvasRenderer';
import { EditorComponent } from './EditorComponent';
import { IEditor } from './IEditor';

export enum MouseMoveAction {
  None,
  Pan,
  Zoom,
  Place,
}

/**
 * Manages the editor canvas event handling
 */
export class EditorCanvas extends EditorComponent {
  canvas: HTMLCanvasElement;
  canvasRenderer: CanvasRenderer;
  scaleStep: number;
  lastPos: vec2;
  moveVector: vec2;
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

    this.scaleStep = 0.02;

    this.canvas.addEventListener('keyup', this.keyup.bind(this));
    this.canvas.addEventListener('keydown', this.keydown.bind(this));
    this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
    this.canvas.addEventListener('mouseleave', this.mouseExit.bind(this));
    this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
    this.canvas.addEventListener('wheel', this.mouseWheel.bind(this));
    this.canvas.setAttribute('tabindex', '1');
    return this.canvas;
  }

  keyup(e: KeyboardEvent): void {
    //this.canvas.style.cursor = 'pointer';
  }
  keydown(e: KeyboardEvent): void {}

  mouseDown(e: MouseEvent) {
    this.lastPos = undefined;
  }

  mouseExit(e: MouseEvent) {
    this.lastPos = undefined;
    console.debug('down', e);
  }

  mouseUp(e: MouseEvent) {
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
    if (!this.lastPos) {
      console.debug('reset');
      this.lastPos = new vec2(e.offsetX, e.offsetY);
    }

    const delta = new vec2(e.offsetX, e.offsetY).subtract(this.lastPos);

    if (e.shiftKey) {
      // pan
      this.canvas.style.cursor = 'grab';
      const scale = 0.5;

      const offset = this.canvasRenderer.offset.add(delta.scale(scale));
      console.debug('delta ' + delta + ' offset ' + offset);
      this.canvasRenderer.setOffset(offset);
      this.lastPos = new vec2(e.offsetX, e.offsetY);
    } else if (e.ctrlKey) {
      //zoom
      this.canvas.style.cursor = 'zoom-in';
      const scaleStep = delta.y < 0 ? -this.scaleStep : this.scaleStep;
      const scale = this.canvasRenderer.scale + scaleStep;
      console.debug('zoom ' + scale + ' ' + delta.y + ' ' + this.canvasRenderer.scale + '  ' + scaleStep);
      this.zoom(scale);
      if (Math.abs(delta.y) > 10) {
        this.lastPos = new vec2(e.offsetX, e.offsetY);
      }
    } else {
      this.canvas.style.cursor = 'pointer';
      if (e.buttons == 1) {
        //place
        var rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width; // relationship bitmap vs. element for x
        const scaleY = this.canvas.height / rect.height; // relationship bitmap vs. element for y

        const point = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };

        this.canvasRenderer.select(point.x, point.y);
      } else {
        // reset last pos
        this.lastPos = undefined;
      }
    }
  }

  render() {
    this.canvasRenderer.render();
  }
}
