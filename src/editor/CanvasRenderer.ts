import rect from '../math/rect';
import vec2 from '../math/vec2';
import * as MathConst from '../math/constants';
import { EditorComponent } from './EditorComponent';
import { IEditor } from './IEditor';
import { JobPlaceTile, SelectTileBrowserData, TilePlaceLocation } from './JobPlaceTile';
import { ToolbarOptions } from './ToolbarOptions';

/**
 * Render to the canvas editor
 */
export class CanvasRenderer extends EditorComponent {
  private maxScale: number;
  private minScale: number;
  private _scale: number;
  private _offset: vec2;
  private offsetBounds: rect;
  private dirty: boolean;
  private selectedTile: { i: number; j: number };
  private _activeLayer: number;

  readonly MaxI = 50;
  readonly MaxJ = 50;
  readonly MaxK = 10;

  private tiles: SelectTileBrowserData[][][];

  get scale(): number {
    return this._scale;
  }
  get offset() {
    return this._offset.copy();
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx;
  }

  constructor(editor: IEditor, private ctx: CanvasRenderingContext2D) {
    super(editor);
    this.ctx.imageSmoothingEnabled = false;
    this.offsetBounds = new rect([-200, 4000, -2000, 4000]);
    this._scale = 1.0;
    this.minScale = 0.3;
    this.maxScale = 4;
    this._offset = new vec2(400, 10); // 600, 450
    this.dirty = true;
    this.tiles = [];
    this.selectedTile = { i: -1, j: -1 };
    this._activeLayer = 0;

    // allocate 3 dimensions of tiles
    for (let k = 0; k < this.MaxK; k++) {
      this.tiles.push([]);
      for (let j = 0; j < this.MaxJ; j++) {
        if (this.tiles[k] == undefined) {
          this.tiles[k] = [];
        }
        for (let i = 0; i < this.MaxI; i++) {
          if (this.tiles[k][j] == undefined) {
            this.tiles[k][j] = [];
          }
        }
      }
    }
  }

  setTile(data: SelectTileBrowserData, i: number, j: number, k: number): void {
    this.tiles[k][j][i] = data;
    this.dirty = true;
  }

  getTile(i: number, j: number, k: number) {
    return this.tiles[k][j][i];
  }

  render() {
    if (this.dirty) {
      this.ctx.lineWidth = 1;

      // reset transform
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Use the identity matrix while clearing the canvas
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      // scale
      this.ctx.scale(this.scale, this.scale);

      // translate
      this.ctx.translate(this.offset.x, this.offset.y);

      this.renderTiles();

      this.renderGrid();
    }

    this.dirty = false;
  }

  setScale(value: number) {
    const currentScale = this.scale;
    this._scale = MathConst.clamp(value, this.minScale, this.maxScale);
    const scaleDelta = this.scale - currentScale;
    const baseOffsetX = this._offset.x / (this.ctx.canvas.width * currentScale);
    const baseOffsetY = this._offset.y / (this.ctx.canvas.height * currentScale);

    const newOffset = new vec2(
      baseOffsetX * this.ctx.canvas.width * this._scale,
      baseOffsetY * this.ctx.canvas.height * this._scale
    );

    this.setOffset(newOffset);
    this.dirty = true;
  }

  setOffset(value: vec2) {
    this._offset.x = MathConst.clamp(value.x, this.offsetBounds.left, this.offsetBounds.right);
    this._offset.y = MathConst.clamp(value.y, this.offsetBounds.top, this.offsetBounds.bottom);

    this.dirty = true;
  }

  private renderTiles(): void {
    const stepX = 16;
    const stepY = 16;
    for (let k = 0; k < this.MaxK; k++) {
      for (let j = 0; j < this.MaxJ; j++) {
        for (let i = 0; i < this.MaxI; i++) {
          // if there is a tile draw it
          if (this.tiles[k][j][i]) {
            this.drawTile(this.tiles[k][j][i], i, j, k);
          }
        }
      }
    }
  }

  /**
   * Draws an image onto a canvas
   * @param canvas
   * @param left
   * @param top
   */
  private drawTile(data: SelectTileBrowserData, i: number, j: number, k: number): void {

    const screen = this.eng.tileHelper.toScreenLoc(i + .5, j + .5, k, true);
    const img = data.image;
    const x = data.sx + 1;
    const y = data.sy + 1;
    const w = data.srcWidth - 2;
    const h = data.srcHeight - 2;

    const destX = - screen.x + data.offsetX;
    const destY = screen.y - data.offsetY - h * 2;

    this.context.drawImage(img, x, y, w, h, destX, destY, w * 2, h * 2);
  }

  public select(left: number, top: number): void {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#00ff00';
    const x = left / this.scale - this.offset.x;
    const y = top / this.scale - this.offset.y;
    const w = 32 * this.scale;
    const h = 32 * this.scale;

    const tileI = (x * -1) / 64 + (y * 1) / 32;
    const tileJ = x / 64 + (y * 1) / 32;

    this.selectedTile.i = Math.floor(tileI);
    this.selectedTile.j = Math.floor(tileJ);
    console.debug(' tile ' + tileI.toFixed(4) + ', ' + tileJ.toFixed(4));
    console.debug(' screen ' + screenX.toFixed(4) + ', ' + screenY.toFixed(4));
    this.dirty = true;

    const ed = this.editor;
    if (ed.toolbar.selectedTool == ToolbarOptions.Place) {
      let selected: SelectTileBrowserData = null;
      const selectedTile = this.editor.tileBrowser.selectedItem?.spriteData;

      if (selectedTile) {
        selected = {
          sx: selectedTile.tileData.loc[0],
          sy: selectedTile.tileData.loc[1],
          srcHeight: selectedTile.tileData.loc[2],
          srcWidth: selectedTile.tileData.loc[3],
          offsetX: selectedTile.tileData.offset[0],
          offsetY: selectedTile.tileData.offset[1],
          image: selectedTile.image,
          tileIndex: selectedTile.tileIndex
        };
      }
      const location = new TilePlaceLocation(this.selectedTile.i, this.selectedTile.j, this._activeLayer);
      const placeJob = new JobPlaceTile(ed, selected, location);
      ed.jobManager.execute(placeJob);
    }
  }

  private renderGrid(): void {
    this.ctx.beginPath();

    const stepX = 16;
    const stepY = 16;

    this.ctx.strokeStyle = '#000000';
    const maxI = 50;
    const maxJ = 50;
    for (let i = 0; i < this.MaxI; i++) {
      const x1 = -i * stepX * 2;
      const y1 = i * stepY + this._activeLayer * stepY * .5;
      const x2 = -i * stepX * 2 + (maxJ - 1) * stepX * 2;
      const y2 = (maxJ - 1) * stepX + i * stepY + this._activeLayer * stepY * .5;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    for (let j = 0; j < this.MaxJ; j++) {
      const x1 = j * stepX * 2;
      const y1 = j * stepY;
      const x2 = j * stepX * 2 - (maxI - 1) * stepX * 2;
      const y2 = (maxI - 1) * stepX + j * stepY;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    this.ctx.stroke();

    if (this.selectedTile.i >= 0 && this.selectedTile.j >= 0) {
      const i = this.selectedTile.i;
      const j = this.selectedTile.j;
      // top
      const p0 = { x: -i * stepX * 2 + j * stepY * 2, y: i * stepX + j * stepY };
      // right
      const p1 = { x: -i * stepX * 2 + j * stepY * 2 + stepX * 2, y: i * stepX + j * stepY + stepY };
      // left
      const p2 = { x: -i * stepX * 2 + j * stepY * 2 - stepX * 2, y: i * stepX + j * stepY + stepY };
      // bottom
      const p3 = { x: -i * stepX * 2 + j * stepY * 2, y: i * stepX + j * stepY + stepY * 2 };

      this.ctx.beginPath();
      this.ctx.strokeStyle = 'rgb(0,255,0)';
      this.ctx.lineWidth = 2;
      this.ctx.moveTo(p0.x, p0.y);
      this.ctx.lineTo(p1.x, p1.y);
      this.ctx.lineTo(p3.x, p3.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }
}
