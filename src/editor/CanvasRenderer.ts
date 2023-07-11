import rect from '../math/rect';
import vec2 from '../math/vec2';
import * as MathConst from '../math/constants';
import { EditorComponent } from './EditorComponent';
import { IEditor } from './IEditor';
import { RenderTiles } from './TileBrowser';
import vec3 from '../math/vec3';

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

  readonly MaxI = 50;
  readonly MaxJ = 50;

  private tiles: RenderTiles[][];

  get scale(): number {
    return this._scale;
  }
  get offset() {
    return this._offset.copy();
  }

  constructor(editor: IEditor, private ctx: CanvasRenderingContext2D) {
    super(editor);
    this.ctx.imageSmoothingEnabled = false;
    this.offsetBounds = new rect([-200, 4000, -2000, 4000]);
    this._scale = 1.0;
    this.minScale = 0.3;
    this.maxScale = 4;
    this._offset = new vec2(400, 300); // 600, 450
    this.dirty = true;
    this.tiles = [];
    this.selectedTile = { i: -1, j: -1 };

    for (let i = 0; i < this.MaxI; i++) {
      this.tiles.push([]);
      for (let j = 0; j < this.MaxJ; j++) {
        if (this.tiles[i] == undefined) {
          this.tiles[i] = [];
        }
        this.tiles[i].push(undefined);
      }
    }
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
    const offset = new vec2(this.ctx.canvas.width, this.ctx.canvas.height).scale(scaleDelta);
    const newOffset = this.offset.add(offset);

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
    for (let i = 0; i < this.MaxI; i++) {
      for (let j = 0; j < this.MaxJ; j++) {
        // if there is a tile draw it
        if (this.tiles[i][j]) {
          //const image =
          //this.ctx.drawImage()
        }
      }
    }
  }

  public select(left: number, top: number): void {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#00ff00';
    const x = left / this.scale - this.offset.x;
    const y = top / this.scale - this.offset.y;
    const w = 32 * this.scale;
    const h = 32 * this.scale;

    const width = this.editor.editorCanvas.width;
    const height = this.editor.editorCanvas.height;
    const tileI = (x * -1) / 64 + (y * 1) / 32;
    const tileJ = x / 64 + (y * 1) / 32;

    this.selectedTile.i = Math.floor(tileI);
    this.selectedTile.j = Math.floor(tileJ);
    console.debug(' tile ' + tileI.toFixed(4) + ', ' + tileJ.toFixed(4));
    console.debug(' screen ' + screenX.toFixed(4) + ', ' + screenY.toFixed(4));
    this.dirty = true;
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
      const y1 = i * stepY;
      const x2 = -i * stepX * 2 + (maxJ - 1) * stepX * 2;
      const y2 = (maxJ - 1) * stepX + i * stepY;

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
