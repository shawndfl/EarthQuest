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
import { ILevelData } from '../environment/ILevelData';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { TileBrowser2 } from './TileBrowser2';

/**
 * Editor class manages all the components of the editor
 */
export class Editor extends Component implements IEditor {
  private _parent: HTMLElement;
  readonly toolbar: Toolbar;
  readonly tileBrowser: TileBrowser;
  readonly tileBrowser2: TileBrowser2;
  readonly editorCanvas: EditorCanvas;
  readonly statusBar: StatusBar;
  readonly menuBar: MenuBar;
  readonly jobManager: JobManager;
  readonly tileHelper: TileHelper;

  readonly zoomStep: number = 0.1;

  isEnabled: boolean;

  public get parent(): HTMLElement {
    return this._parent;
  }

  constructor(eng: Engine) {
    super(eng);
    this.toolbar = new Toolbar(this);
    this.tileBrowser = new TileBrowser(this);
    this.tileBrowser2 = new TileBrowser2(this);
    this.statusBar = new StatusBar(this);
    this.menuBar = new MenuBar(this);
    this.editorCanvas = new EditorCanvas(this);
    this.jobManager = new JobManager(this);
    this.tileHelper = new TileHelper();
    this.isEnabled = false;
  }

  async initialize(parentContainer: HTMLElement) {
    this._parent = document.createElement('div');
    this._parent.classList.add('editor');

    parentContainer.append(this._parent);
    this.tileHelper.calculateTransform(this.editorCanvas.width, this.editorCanvas.height);

    await this.tileBrowser2.initialize();
    await this.buildHtml();

    this.buildToolbar();
    this.editorCanvas.render();
  }

  loadLevel(level: ILevelData): void {

  }

  hide(): void {
    this._parent.style.display = 'none';
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
    entityContainer.append(this.tileBrowser2.container);
    entityContainer.style.width = '300px';

    let lastX = 0;
    let mouseDown = false;

    // add resizable bar
    const resizable = document.createElement('div');
    window.addEventListener('mousemove', (e) => {
      if (mouseDown) {
        const dx = e.x - lastX;
        lastX = e.x;
        const width = parseInt(entityContainer.style.width);
        entityContainer.style.width = (width + dx) + 'px';
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
    this.toolbar.addButton('save', File, 'Save', () => {
      console.debug('Saving!!');
    });
    this.toolbar.addButton('open', File, 'Open', () => {
      console.debug('Open!!');
    });
    this.toolbar.addButton('play', File, 'Play', () => {
      console.debug('Playing!!');
      this.eng
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
