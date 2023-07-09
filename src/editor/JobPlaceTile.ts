import { IEditor } from './IEditor';
import { Job } from './Job';

/**
 * All the information needed to define
 * a selected tile.
 */
export interface SelectTileBrowserData {
  sx: number;
  sy: number;
  srcIndex: number;
  width: number;
  height: number;
  /** offset in pixels */
  offsetX: number;
  /** offset in pixels */
  offsetY: number;
}

/**
 * Location in the CanvasRenderer to place the tile.
 */
export interface TilePlaceLocation {
  row: number;
  col: number;
  layer: number;
}

/**
 * This job will place a tile from the tile browser to a location on the canvas renderer
 */
export class JobPlaceTile extends Job {
  constructor(editor: IEditor, private selected: SelectTileBrowserData, private location: TilePlaceLocation) {
    super(editor);
  }

  redo(): void {}
  execute(): void {
    //TODO save off state from the place location
    // Apply the selected tile to the location
  }
  undo(): void {}
}
