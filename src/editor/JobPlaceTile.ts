import { IEditor } from './IEditor';
import { Job } from './Job';

/**
 * All the information needed to define
 * a selected tile.
 */
export interface SelectTileBrowserData {
  /** Source x location for tileBrowser */
  sx: number;
  /** Source y location for tileBrowser */
  sy: number;
  /** index into list of tileBrowser */
  srcIndex: number;
  /** width of the tile */
  srcWidth: number;
  /** height of the tile */
  srcHeight: number;
  /** offset in pixels from the left corner. This is used when placing a tile. */
  offsetX: number;
  /** offset in pixels from the top corner. This is used when placing a tile. */
  offsetY: number;
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
  private lastTileValue: TilePlaceLocation;

  constructor(editor: IEditor, private selected: SelectTileBrowserData, private location: TilePlaceLocation) {
    super(editor);
  }

  redo(): void {}

  execute(): void {
    this.lastTileValue = this.location.clone();

    this.editor.editorCanvas.canvasRenderer.setTile(
      this.selected,
      this.location.iRow,
      this.location.jCol,
      this.location.layer
    );
  }
  undo(): void {
    //TODO
  }
}
