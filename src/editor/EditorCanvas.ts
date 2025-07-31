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
  lastButtonDown: number;
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
    var rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width; // relationship bitmap vs. element for x
    const scaleY = this.canvas.height / rect.height; // relationship bitmap vs. element for y

    const point = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    if (this.editor.toolbar.selectedTool == ToolbarOptions.Place && (this.lastButtonDown & 0x04) == 0) {
      this.canvasRenderer.select(point.x, point.y, true);
    }
  }

  mouseWheel(e: WheelEvent) {
    const delta = e.deltaY > 0 ? -this.scaleStep : this.scaleStep;
    const scale = this.canvasRenderer.scale;
    this.zoom(scale + delta);
  }

  zoom(scale: number): void {
    this.canvasRenderer.setScale(scale);
  }

  mouseMove(e: MouseEvent) {
    if (!this.lastPos) {
      this.lastPos = new vec2(e.clientX, e.clientY);
    }

    //select
    var rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width; // relationship bitmap vs. element for x
    const scaleY = this.canvas.height / rect.height; // relationship bitmap vs. element for y

    const canvasPoint = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    const canvasPointLast = {
      x: (this.lastPos.x - rect.left) * scaleX,
      y: (this.lastPos.y - rect.top) * scaleY,
    };
    const delta = new vec2(canvasPoint.x - canvasPointLast.x, canvasPoint.y - canvasPointLast.y);
    this.canvas.style.cursor = 'pointer';

    // if the mouse is left button down
    if ((e.buttons & 0x01) > 0) {
      if (this.editor.toolbar.selectedTool == ToolbarOptions.Pan) {
        // pan
        this.editor.toolbar.setActive(this.editor.toolbar.getButton('pan'), true);
        this.editor.toolbar.setActive(this.editor.toolbar.getButton('place'), false);
        this.canvas.style.cursor = 'grab';
        const offset = this.canvasRenderer.offset.add(delta);
        this.canvasRenderer.setOffset(offset);
        this.lastPos = new vec2(e.clientX, e.clientY);
      } else if (this.editor.toolbar.selectedTool == ToolbarOptions.Place) {
        this.editor.toolbar.setActive(this.editor.toolbar.getButton('place'), true);
        this.editor.toolbar.setActive(this.editor.toolbar.getButton('pan'), false);
        this.canvasRenderer.select(canvasPoint.x, canvasPoint.y, true);
      }
    }
    // middle mouse
    else if ((e.buttons & 0x04) > 0) {
      if (this.editor.toolbar.selectedTool == ToolbarOptions.Place) {
        // pan
        this.editor.toolbar.setActive(this.editor.toolbar.getButton('pan'), true);
        this.editor.toolbar.setActive(this.editor.toolbar.getButton('place'), false);
        this.canvas.style.cursor = 'grab';
        const offset = this.canvasRenderer.offset.add(delta);
        this.canvasRenderer.setOffset(offset);
        this.lastPos = new vec2(e.clientX, e.clientY);
      }
    }
    // if the mouse is panning with the mouse up
    else if (e.buttons == 0) {
      this.canvasRenderer.select(canvasPoint.x, canvasPoint.y, false);

      // reset last pos
      this.lastPos = undefined;
    }

    this.lastButtonDown = e.buttons;
  }

  render() {
    this.canvasRenderer.render();
  }
}
