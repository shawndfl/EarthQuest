import { SpriteFlip } from '../graphics/Sprite';
import { IEditor } from './IEditor';
import { Job } from './Job';

/**
 * All the information needed to define
 * a selected tile.
 */
export class SelectTileBrowserData {
  /** Source x location for tileBrowser */
  sx: number;
  /** Source y location for tileBrowser */
  sy: number;
  /** source image */
  image: HTMLImageElement;
  /** width of the tile */
  srcWidth: number;
  /** height of the tile */
  srcHeight: number;
  /** offset in pixels from the left corner. This is used when placing a tile. */
  offsetX: number;
  /** offset in pixels from the top corner. This is used when placing a tile. */
  offsetY: number;
  /** Sprite index */
  spriteIndex: number;
  /** Used when saving the level data */
  typeIndex: number;
  /** flip the image */
  flip: SpriteFlip;

  clone(): SelectTileBrowserData {
    const newData = new SelectTileBrowserData();
    newData.sx = this.sx;
    newData.sy = this.sy;
    newData.image = this.image;
    newData.srcWidth = this.srcWidth;
    newData.srcHeight = this.srcHeight;
    newData.offsetX = this.offsetX;
    newData.offsetY = this.offsetY;
    newData.spriteIndex = this.spriteIndex;
    newData.typeIndex = this.typeIndex;
    newData.flip = this.flip;

    return newData;
  }
}

/**
 * Location in the CanvasRenderer to place the tile.
 */
export class TilePlaceLocation {
  constructor(public iRow: number, public jCol: number, public layer: number) {}

  clone(): TilePlaceLocation {
    return new TilePlaceLocation(this.iRow, this.jCol, this.layer);
  }
}

/**
 * This job will place a tile from the tile browser to a location on the canvas renderer
 */
export class JobPlaceTile extends Job {
  private lastTileValue: SelectTileBrowserData;
  private location: TilePlaceLocation;

  constructor(editor: IEditor, private selected: SelectTileBrowserData, location: TilePlaceLocation) {
    super(editor);
    this.location = location.clone();
  }

  redo(): void {}

  execute(): void {
    const i = this.location.iRow;
    const j = this.location.jCol;
    const k = this.location.layer;
    this.lastTileValue = this.editor.editorCanvas.canvasRenderer.getTile(i, j, k)?.clone();
    console.debug('placing ', this);
    this.editor.editorCanvas.canvasRenderer.setTile(this.selected, i, j, k);
  }
  undo(): void {
    const i = this.location.iRow;
    const j = this.location.jCol;
    const k = this.location.layer;
    console.debug('undoing ', this);
    this.editor.editorCanvas.canvasRenderer.setTile(this.lastTileValue, i, j, k);
  }
}
