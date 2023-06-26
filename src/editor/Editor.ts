import { TileBrowser } from './TileBrowser';
import { ToolbarView } from './ToolbarView';
import '../css/Editor.scss';
import File from '../assets/editor/file.svg';
import { EditorCanvas } from './EditorCanvas';
import { IEditor } from './IEditor';

/**
 * Editor class manages all the components of the editor
 */
export class Editor implements IEditor {
  private _parent: HTMLElement;
  readonly toolbarView: ToolbarView;
  readonly tileBrowser: TileBrowser;
  readonly editorCanvas: EditorCanvas;

  readonly zoomStep: number = 0.1;

  public get parent(): HTMLElement {
    return this._parent;
  }

  constructor() {
    this.toolbarView = new ToolbarView();
    this.tileBrowser = new TileBrowser(this);
    this.editorCanvas = new EditorCanvas();
  }

  async initialize(parentContainer: HTMLElement) {
    this._parent = parentContainer;
    this.buildHtml();
    this.buildToolbar();
    this.editorCanvas.render();
  }

  update(dt: number) {
    this.editorCanvas.render();
  }

  buildHtml() {
    const main = document.createElement('div');
    main.classList.add('editor-main');

    this._parent.append(this.toolbarView.buildHtml());

    const entityContainer = document.createElement('div');
    entityContainer.classList.add('editor-entity-container');
    entityContainer.append(this.tileBrowser.buildHtml());

    let lastX = 0;
    let mouseDown = false;

    // add resizable bar
    const resizable = document.createElement('div');
    window.addEventListener('mousemove', (e) => {
      if (mouseDown) {
        const dx = e.x - lastX;
        lastX = e.x;
        const width = parseInt(getComputedStyle(entityContainer, '').width);
        entityContainer.style.width = width + dx + 'px';
        e.preventDefault();
      }
    });
    window.addEventListener('mouseup', (e) => {
      mouseDown = false;
    });
    resizable.addEventListener('mousedown', (e) => {
      if (e.buttons === 1) {
        mouseDown = true;
        lastX = e.x;
      }
    });
    resizable.addEventListener('mouseup', (e) => {
      mouseDown = false;
    });

    resizable.classList.add('editor-h-resize');

    main.append(entityContainer, resizable, this.editorCanvas.buildHtml());

    this._parent.append(main);
  }

  buildToolbar() {
    this.toolbarView.addButton('new', File, 'New Scene', () => {
      console.debug('new scene!!');
    });

    this.toolbarView.addButton('zoomIn', File, 'Zoom In', () => {
      const scale = this.editorCanvas.canvasRenderer.scale;
      this.editorCanvas.canvasRenderer.setScale(scale + this.zoomStep);
    });

    this.toolbarView.addButton('zoomOut', File, 'Zoom Out', () => {
      const scale = this.editorCanvas.canvasRenderer.scale;
      this.editorCanvas.canvasRenderer.setScale(scale - this.zoomStep);
    });
  }
}
