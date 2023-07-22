import { TileBrowser } from './TileBrowser';
import { Toolbar } from './Toolbar';
import '../css/Editor.scss';
import File from '../assets/editor/file.svg';
import { EditorCanvas } from './EditorCanvas';
import { IEditor } from './IEditor';
import { StatusBar } from './StatusBar';
import { MenuBar } from './MenuBar';
import { JobManager } from './JobManager';
import { TileHelper } from '../utilities/TileHelper';
import { ToolbarOptions } from './ToolbarOptions';

/**
 * Editor class manages all the components of the editor
 */
export class Editor implements IEditor {
  private _parent: HTMLElement;
  readonly toolbar: Toolbar;
  readonly tileBrowser: TileBrowser;
  readonly editorCanvas: EditorCanvas;
  readonly statusBar: StatusBar;
  readonly menuBar: MenuBar;
  readonly jobManager: JobManager;
  readonly tileHelper: TileHelper;

  readonly zoomStep: number = 0.1;

  public get parent(): HTMLElement {
    return this._parent;
  }

  constructor() {
    this.toolbar = new Toolbar(this);
    this.tileBrowser = new TileBrowser(this);
    this.statusBar = new StatusBar(this);
    this.menuBar = new MenuBar(this);
    this.editorCanvas = new EditorCanvas(this);
    this.jobManager = new JobManager(this);
    this.tileHelper = new TileHelper();
  }

  async initialize(parentContainer: HTMLElement) {
    this._parent = parentContainer;
    this.tileHelper.calculateTransform(this.editorCanvas.width, this.editorCanvas.height);

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

    this._parent.append(this.toolbar.buildHtml());

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
    this.toolbar.addButton('new', File, 'New Scene', () => {
      console.debug('new scene!!');
    });

    this.toolbar.addButton('zoomIn', File, 'Zoom In', () => {
      const scale = this.editorCanvas.canvasRenderer.scale;
      this.editorCanvas.canvasRenderer.setScale(scale + this.zoomStep);
    });

    this.toolbar.addButton('zoomOut', File, 'Zoom Out', () => {
      const scale = this.editorCanvas.canvasRenderer.scale;
      this.editorCanvas.canvasRenderer.setScale(scale - this.zoomStep);
    });

    this.toolbar.addButton('undo', File, 'Undo', () => {
      this.jobManager.undo();
    });

    this.toolbar.addButton('redo', File, 'Redo', () => {
      this.jobManager.redo();
    });

    this.toolbar.addButton('place', File, 'Place', (button: HTMLElement) => {
      this.toolbar.selectedTool = ToolbarOptions.Place;

      this.toolbar.setActive(button, true);

      const pan = this.toolbar.getButton('pan');
      this.toolbar.setActive(pan, false);
    });
    this.toolbar.addButton('pan', File, 'Pan', () => {
      this.toolbar.selectedTool = ToolbarOptions.Place;
    });

    // set default
    this.toolbar.selectedTool = ToolbarOptions.Place;
    this.toolbar.setActive(this.toolbar.getButton('place'), true);
  }
}
