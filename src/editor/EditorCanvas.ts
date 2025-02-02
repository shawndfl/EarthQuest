import '../css/EditorCanvas.scss';
import vec2 from '../math/vec2';
import { CanvasRenderer } from './CanvasRenderer';
import { EditorComponent } from './EditorComponent';
import { IEditor } from './IEditor';
import { ToolbarOptions } from './ToolbarOptions';

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
  container: HTMLElement;

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

    this.scaleStep = 0.005;

    this.buildHtml();
  }

  private buildHtml(): void {
    this.container = document.createElement('div');
    this.container.classList.add('editor-canvas-container');

    this.canvas = document.createElement('canvas');

    this.canvas.classList.add('editor-canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.addEventListener('keyup', this.keyup.bind(this));
    this.canvas.addEventListener('keydown', this.keydown.bind(this));
    this.canvas.addEventListener('mousedown', this.mouseDown.bind(this));
    this.canvas.addEventListener('mouseleave', this.mouseExit.bind(this));
    this.canvas.addEventListener('mouseup', this.mouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.mouseMove.bind(this));
    this.canvas.addEventListener('wheel', this.mouseWheel.bind(this));
    this.canvas.setAttribute('tabindex', '1');

    const context = this.canvas.getContext('2d');
    this.canvasRenderer = new CanvasRenderer(this.editor, context);

    const activeLayerInput = document.createElement('input');
    activeLayerInput.setAttribute('type', 'number');
    activeLayerInput.classList.add('active-layer');
    activeLayerInput.min = '0';
    activeLayerInput.max = this.canvasRenderer.MaxK.toString();
    activeLayerInput.value = '0';
    activeLayerInput.addEventListener('change', () => {
      this.canvasRenderer.activeLayer = Number.parseInt(activeLayerInput.value);
    });
    this.container.append(this.canvas, activeLayerInput);
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
      this.lastPos = new vec2(e.offsetX, e.offsetY);
    }

    const delta = new vec2(e.offsetX, e.offsetY).subtract(this.lastPos);

    //select
    var rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width; // relationship bitmap vs. element for x
    const scaleY = this.canvas.height / rect.height; // relationship bitmap vs. element for y

    const point = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };

    this.canvasRenderer.select(point.x, point.y);
    this.canvas.style.cursor = 'pointer';
    this.editor.toolbar.selectedTool = ToolbarOptions.Pan;

    if (e.shiftKey) {
      this.editor.toolbar.selectedTool = ToolbarOptions.Place;
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
      if (e.buttons == 1) {
        // pan
        this.canvas.style.cursor = 'grab';
        const scale = 0.9;

        const offset = this.canvasRenderer.offset.add(delta.scale(scale));

        this.canvasRenderer.setOffset(offset);
        this.lastPos = new vec2(e.offsetX, e.offsetY);
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
