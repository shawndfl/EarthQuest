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
import { SelectTileBrowserData } from './JobPlaceTile';
import { TileFactory } from '../systems/TileFactory';

/**
 * Editor class manages all the components of the editor
 */
export class Editor extends Component implements IEditor {
  private _parent: HTMLElement;
  readonly toolbar: Toolbar;
  readonly tileBrowser: TileBrowser2;
  readonly editorCanvas: EditorCanvas;
  readonly statusBar: StatusBar;
  readonly menuBar: MenuBar;
  readonly jobManager: JobManager;

  readonly zoomStep: number = 0.1;
  levelData: ILevelData;
  isEnabled: boolean;

  public get parent(): HTMLElement {
    return this._parent;
  }

  constructor(eng: Engine) {
    super(eng);
    this.toolbar = new Toolbar(this);
    this.tileBrowser = new TileBrowser2(this);
    this.statusBar = new StatusBar(this);
    this.menuBar = new MenuBar(this);
    this.editorCanvas = new EditorCanvas(this);
    this.jobManager = new JobManager(this);
    this.isEnabled = false;
  }

  async initialize(parentContainer: HTMLElement) {
    this._parent = document.createElement('div');
    this._parent.classList.add('editor');

    parentContainer.append(this._parent);

    await this.tileBrowser.initialize();
    await this.buildHtml();

    this.buildToolbar();
    this.editorCanvas.render();
  }

  loadLevel(level: ILevelData): void {
    this.levelData = level;
    this.tileBrowser.refreshLevel(level);
    for (let k = 0; k < level.encode.length; k++) {
      for (let j = 0; j < level.encode[k].length; j++) {

        const row = level.encode[k][j];
        let i = 0;
        for (let s = 0; s < row.length; s += 2) {
          const element = row[s] + row[s + 1];
          const index = parseInt(element, 16);
          const tile = level.tiles[index];

          if (!tile) {
            console.error('invalid index ' + i + ', ' + j + ', ' + k);
            continue;
          }

          let tileTypeData = TileFactory.parseTile(tile);
          if (!tileTypeData) {
            console.warn('invalid tile: \'' + tile + '\'' +
              ' Format should be <tile type>|<sprint id>|[option1,options2,...] ');
            continue;
          }

          const spriteData = this.eng.assetManager.getImageFrom(tileTypeData.spriteId);
          if (spriteData) {
            const tileData: SelectTileBrowserData = {
              sx: spriteData.tileData.loc[0],
              sy: spriteData.tileData.loc[1],
              srcWidth: spriteData.tileData.loc[2],
              srcHeight: spriteData.tileData.loc[3],
              image: spriteData.image,
              offsetX: spriteData.tileData.offset[0],
              offsetY: spriteData.tileData.offset[1],
              tileIndex: index
            };

            this.editorCanvas.canvasRenderer.setTile(tileData, i, j, k);
            i++;
          }
        }
      }
    }
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
    entityContainer.append(this.tileBrowser.container);
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

    const saveButton = this.toolbar.addButton('save', File, 'Save', (source: MouseEvent) => {
      const maxI = this.editorCanvas.canvasRenderer.MaxI;
      const maxJ = this.editorCanvas.canvasRenderer.MaxJ;
      const maxK = this.editorCanvas.canvasRenderer.MaxK;
      const tiles: string[][] = [[]];
      for (let k = 0; k < maxK; k++) {
        tiles.push([])
        for (let j = 0; j < maxJ; j++) {
          if (tiles[k] == undefined) {
            tiles[k] = [];
          }
          let row = '';
          for (let i = 0; i < maxI; i++) {
            const tile = this.editorCanvas.canvasRenderer.getTile(i, j, k);
            if (tile) {
              const index = tile.tileIndex;
              row += index.toString(16).padStart(2, '0');
            } else {
              row += '00';
            }
          }
          tiles[k].push(row);
        }
      }
      this.levelData.cells = [[[]]]
      this.levelData.encode = tiles;

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.levelData));
      const downloadAnchorElem = document.createElement('a');
      this._parent.append(downloadAnchorElem);
      downloadAnchorElem.setAttribute("href", dataStr);
      downloadAnchorElem.setAttribute("download", "scene.json");
      downloadAnchorElem.click();
      downloadAnchorElem.remove();

    });
    this.toolbar.addButton('open', File, 'Open', () => {
      console.debug('Open!!');
    });
    this.toolbar.addButton('play', File, 'Play', () => {


      //this.eng.scene.initialize(this.levelData);
      this.eng.hideEditor();
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

    this.toolbar.addButton('place', File, 'Place', (e: MouseEvent) => {
      const button = e.target as HTMLButtonElement;
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
