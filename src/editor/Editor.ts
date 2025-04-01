import { Toolbar } from './Toolbar';
import '../css/Editor.scss';

// get icons from https://fonts.google.com/icons
import Open from '../assets/editor/file_open.svg';
import New from '../assets/editor/new.svg';
import Save from '../assets/editor/file_save.svg';
import Play from '../assets/editor/play_arrow.svg';
import Undo from '../assets/editor/undo.svg';
import Redo from '../assets/editor/redo.svg';
import ZoomIn from '../assets/editor/zoom_in.svg';
import ZoomOut from '../assets/editor/zoom_out.svg';
import Place from '../assets/editor/place_item.svg';
import PanTool from '../assets/editor/pan_tool.svg';
import Settings from '../assets/editor/settings.svg';
import ColorSample from '../assets/editor/color_sample.svg';
import ColorFill from '../assets/editor/color_fill.svg';
import ImageIcon from '../assets/editor/image.svg';
import Edit from '../assets/editor/edit.svg';

import { EditorCanvas } from './EditorCanvas';
import { IEditor } from './IEditor';
import { StatusBar } from './StatusBar';
import { MenuBar } from './MenuBar';
import { JobManager } from './JobManager';
import { ToolbarOptions } from './ToolbarOptions';
import { cloneLevel, ILevelData } from '../environment/ILevelData';
import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { TileBrowser } from './TileBrowser';
import { SelectTileBrowserData } from './JobPlaceTile';

import NewLevel from '../assets/levels/newLevel.json';
import { SpriteFlip } from '../graphics/Sprite';

/**
 * Editor class manages all the components of the editor
 */
export class Editor extends Component implements IEditor {
  private _parent: HTMLElement;
  readonly toolbar: Toolbar;
  readonly tileBrowser: TileBrowser;
  readonly editorCanvas: EditorCanvas;
  readonly statusBar: StatusBar;
  readonly menuBar: MenuBar;
  readonly jobManager: JobManager;

  readonly zoomStep: number = 0.1;
  public levelData: ILevelData;

  private _isActive: boolean;

  public get isActive(): boolean {
    return this._isActive;
  }

  public get parent(): HTMLElement {
    return this._parent;
  }

  constructor(eng: Engine) {
    super(eng);
    this.toolbar = new Toolbar(this);
    this.tileBrowser = new TileBrowser(this);
    this.statusBar = new StatusBar(this);
    this.menuBar = new MenuBar(this);
    this.editorCanvas = new EditorCanvas(this);
    this.jobManager = new JobManager(this);
  }

  async initialize(parentContainer: HTMLElement) {
    this._parent = document.createElement('div');
    this._parent.classList.add('editor-container');
    this.hide();

    parentContainer.append(this._parent);

    await this.tileBrowser.initialize();
    await this.buildHtml();

    this.buildToolbar();
    this.editorCanvas.render();
  }

  /**
   * Loads a level
   * @param level
   */
  async loadLevel(level: ILevelData): Promise<void> {
    this.levelData = level;

    this.tileBrowser.refreshLevel(level);

    if (!level.map) {
      return;
    }

    // reset the canvas map
    this.editorCanvas.canvasRenderer.resetTiles();

    Object.keys(level.map).forEach((m) => {
      const [i, j, k] = m.split(',').map((i) => Number.parseInt(i));

      if (
        i === undefined ||
        j === undefined ||
        k === undefined ||
        Number.isNaN(i) ||
        Number.isNaN(j) ||
        Number.isNaN(k)
      ) {
        console.error('map keys should be in the form of <i,j,k> not: ' + m);
        return;
      }

      const tileTypeData = level.tiles[level.map[m]];
      if (!tileTypeData) {
        console.error('invalid index ' + i + ', ' + j + ', ' + k);
        return;
      }

      const spriteData = this.eng.assetManager.getImageFrom(tileTypeData.spriteId);
      if (spriteData) {
        const tileData = new SelectTileBrowserData();
        tileData.sx = spriteData.tileData.loc[0];
        tileData.sy = spriteData.tileData.loc[1];
        tileData.srcWidth = spriteData.tileData.loc[2];
        tileData.srcHeight = spriteData.tileData.loc[3];
        tileData.image = spriteData.image;
        tileData.offsetX = spriteData.tileData.offset[0];
        tileData.offsetY = spriteData.tileData.offset[1];
        tileData.id = tileTypeData.id;
        tileData.spriteIndex = spriteData.spriteIndex;
        // flip the sprite if needed
        if (spriteData.tileData.flipX && spriteData.tileData.flipY) {
          tileData.flip = SpriteFlip.FlipBoth;
        } else if (spriteData.tileData.flipY) {
          tileData.flip = SpriteFlip.FlipY;
        } else if (spriteData.tileData.flipX) {
          tileData.flip = SpriteFlip.FlipX;
        }

        if (spriteData.tileData.id == 'empty') {
          this.editorCanvas.canvasRenderer.setTile(null, i, j, k);
        } else {
          this.editorCanvas.canvasRenderer.setTile(tileData, i, j, k);
        }
      }
    });
  }

  /**
   * Hide the editor
   */
  hide(): void {
    this._isActive = false;
    this._parent.classList.add('hidden');
  }

  /**
   * Show the editor
   * @param level
   */
  show(level?: ILevelData): void {
    this._isActive = true;
    this._parent.classList.remove('hidden');
    if (level) {
      this.loadLevel(level);
    }
  }

  update(dt: number) {
    this.editorCanvas.render();
  }

  buildHtml() {
    const main = document.createElement('div');
    main.classList.add('editor-main');

    this._parent.append(this.toolbar.buildHtml());

    const tileBrowserElement = this.tileBrowser.buildHtml();

    let lastX = 0;
    let mouseDown = false;

    // add resizable bar
    const resizable = document.createElement('div');
    window.addEventListener('mousemove', (e) => {
      if (mouseDown) {
        const dx = e.x - lastX;
        lastX = e.x;
        const width = parseInt(tileBrowserElement.style.width);
        tileBrowserElement.style.width = width + dx + 'px';

        this.tileBrowser.updateItemList(width + dx);

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

    main.append(tileBrowserElement, resizable, this.editorCanvas.container);

    this._parent.append(main);
  }

  /**
   * Updates the level data with the state of the canvas render
   */
  updateLevelData() {
    const maxI = this.editorCanvas.canvasRenderer.MaxI;
    const maxJ = this.editorCanvas.canvasRenderer.MaxJ;
    const maxK = this.editorCanvas.canvasRenderer.MaxK;
    this.levelData.map = {};

    for (let k = 0; k < maxK; k++) {
      for (let j = 0; j < maxJ; j++) {
        for (let i = 0; i < maxI; i++) {
          const tile = this.editorCanvas.canvasRenderer.getTile(i, j, k);
          if (tile) {
            this.levelData.map[i + ',' + j + ',' + k] = tile.id;
          }
        }
      }
    }

    // save in local cache
    window.localStorage.setItem('lastLevel', JSON.stringify(this.levelData));
  }

  pickerOpts = {
    types: [
      {
        description: 'Images',
        accept: {
          'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };

  /**
   * builds the tool bar ribbon
   */
  buildToolbar() {
    this.toolbar.addButton('new', New, 'New Scene', () => {
      this.show(NewLevel);
    });

    const saveButton = this.toolbar.addButton('save', Save, 'Save', (source: MouseEvent) => {
      this.updateLevelData();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.levelData));
      const downloadAnchorElem = document.createElement('a');
      this._parent.append(downloadAnchorElem);
      downloadAnchorElem.setAttribute('href', dataStr);
      downloadAnchorElem.setAttribute('download', 'scene.json');
      downloadAnchorElem.click();
      downloadAnchorElem.remove();
    });

    // opening a file
    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'open_file';
    input.style.display = 'none';
    input.accept = '.json';
    input.addEventListener('change', (e: MouseEvent) => {
      if ((e.target as any).files?.length > 0) {
        const file = (e.target as any).files[0];
        const reader = new FileReader();
        reader.onloadend = (evt) => {
          if (evt.target.readyState == FileReader.DONE) {
            const levelData = JSON.parse(reader.result.toString());
            this.show(levelData);
            // clear out the files
            (e.target as any).value = null;
          }
        };
        reader.readAsText(file);
      }
    });
    const openBtn = this.toolbar.addButton('open', Open, 'Open', (e: MouseEvent) => {
      var evt = new MouseEvent('click', {
        relatedTarget: input,
      });
      input.dispatchEvent(evt);
    });
    openBtn.append(input);

    this.toolbar.addButton('play', Play, 'Play', () => {
      this.updateLevelData();
      this.eng.hideEditor();
    });

    this.toolbar.addButton('zoomIn', ZoomIn, 'Zoom In', () => {
      const scale = this.editorCanvas.canvasRenderer.scale;
      this.editorCanvas.canvasRenderer.setScale(scale + this.zoomStep);
    });

    this.toolbar.addButton('zoomOut', ZoomOut, 'Zoom Out', () => {
      const scale = this.editorCanvas.canvasRenderer.scale;
      this.editorCanvas.canvasRenderer.setScale(scale - this.zoomStep);
    });

    this.toolbar.addButton('undo', Undo, 'Undo', () => {
      this.jobManager.undo();
    });

    this.toolbar.addButton('redo', Redo, 'Redo', () => {
      this.jobManager.redo();
    });

    this.toolbar.addButton('place', Place, 'Place', () => {
      const pan = this.toolbar.getButton('pan');
      const place = this.toolbar.getButton('place');

      pan.classList.remove('active');
      place.classList.add('active');
      this.toolbar.selectedTool = ToolbarOptions.Place;
    });

    this.toolbar.addButton('pan', PanTool, 'Pan', (e: MouseEvent) => {
      const pan = this.toolbar.getButton('pan');
      const place = this.toolbar.getButton('place');

      pan.classList.add('active');
      place.classList.remove('active');
      this.toolbar.selectedTool = ToolbarOptions.Pan;
    });

    this.toolbar.addButton('sample', ColorSample, 'Sample', (e: MouseEvent) => {
      const place = this.toolbar.getButton('place');
      place.classList.remove('active');
      this.toolbar.selectedTool = ToolbarOptions.Select;
    });

    this.toolbar.addButton('settings', Settings, 'Settings', () => {
      // TODO show settings dialog
    });

    // set default
    this.toolbar.selectedTool = ToolbarOptions.Place;
    this.toolbar.setActive(this.toolbar.getButton('place'), true);
  }
}
