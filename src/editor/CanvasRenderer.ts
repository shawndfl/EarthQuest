import rect from '../math/rect';
import vec2 from '../math/vec2';
import * as MathConst from '../math/constants';
import { EditorComponent } from './EditorComponent';
import { IEditor } from './IEditor';
import { JobPlaceTile, SelectTileBrowserData, TilePlaceLocation } from './JobPlaceTile';
import { ToolbarOptions } from './ToolbarOptions';
import { SpriteFlip } from '../graphics/Sprite';
import { FlipCanvas } from './FlipCanvas';

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
  private _flipCanvas: FlipCanvas;

  readonly MaxI = 50;
  readonly MaxJ = 50;
  readonly MaxK = 10;

  private tiles: SelectTileBrowserData[][][];

  get activeLayer(): number {
    return this._activeLayer;
  }
  set activeLayer(value: number) {
    this._activeLayer = value;
    this.dirty = true;
  }

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
    this.minScale = 0.5;
    this.maxScale = 1.5;
    this._offset = new vec2(400, 10); // 600, 450
    this.dirty = true;
    this.tiles = [];
    this.selectedTile = { i: -1, j: -1 };
    this._activeLayer = 0;
    this._flipCanvas = new FlipCanvas();

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

  async setTile(data: SelectTileBrowserData, i: number, j: number, k: number): Promise<void> {
    if (i >= this.MaxI || j >= this.MaxJ || k >= this.MaxK) {
      return;
    }
    if (data?.flip) {
      try {
        data.image = await this._flipCanvas.flipImage(data);
      } catch (e) {
        console.error('error loading image ', data);
      }
    }
    this.tiles[k][j][i] = data;
    this.dirty = true;
  }

  getTile(i: number, j: number, k: number): SelectTileBrowserData {
    if (this.tiles[k] && this.tiles[k][j] && this.tiles[k][j][i]) {
      return this.tiles[k][j][i];
    }
    return null;
  }

  render() {
    if (this.dirty) {
      this.ctx.lineWidth = 1;

      // reset transform
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Use the identity matrix while clearing the canvas
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

      // transform
      this.ctx.setTransform(this.scale, 0, 0, this.scale, this.offset.x, this.offset.y);

      this.renderTiles();
    }

    this.dirty = false;
  }

  setScale(value: number) {
    this._scale = MathConst.clamp(value, this.minScale, this.maxScale);
    this.dirty = true;
  }

  setOffset(value: vec2) {
    this._offset.x = MathConst.clamp(value.x, this.offsetBounds.left, this.offsetBounds.right);
    this._offset.y = MathConst.clamp(value.y, this.offsetBounds.top, this.offsetBounds.bottom);

    this.dirty = true;
  }

  private renderTiles(): void {
    for (let k = 0; k < this.MaxK; k++) {
      let alpha = 1;

      // make all the layers fade out
      if (k != this._activeLayer) {
        alpha = Math.max(0, 1 - Math.abs(k - this._activeLayer) / this.MaxK - 0.5);
      }
      this.context.globalAlpha = alpha;

      for (let j = 0; j < this.MaxJ; j++) {
        for (let i = 0; i < this.MaxI; i++) {
          // if there is a tile draw it
          if (this.tiles[k][j][i]) {
            this.drawTile(this.tiles[k][j][i], i, j, k);
          }
        }
      }
      if (k == this._activeLayer) {
        this.context.globalAlpha = 0.5;
        this.renderGrid();
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
    const screen = this.eng.tileHelper.toScreenLoc(i + 0.5, j + 0.5, k, true);
    const img = data.image;
    const x = data.sx;
    const y = data.sy;
    const w = data.srcWidth;
    const h = data.srcHeight;

    const destX = -screen.x + data.offsetX;
    const destY = screen.y - data.offsetY - h * 2;

    this.context.drawImage(img, x, y, w, h, destX, destY, w * 2, h * 2);
  }

  public select(left: number, top: number, place: boolean): void {
    this.ctx.beginPath();
    this.ctx.fillStyle = '#00ff00';
    const x = (left - this.offset.x) / this.scale;
    const y = (top - this.offset.y) / this.scale;
    const koffset = this._activeLayer;
    const w = 32 * this.scale;
    const h = 32 * this.scale;

    const tileI = (x * -1) / 64 + (y * 1) / 32;
    const tileJ = x / 64 + (y * 1) / 32;

    this.selectedTile.i = Math.floor(tileI + koffset);
    this.selectedTile.j = Math.floor(tileJ + koffset);
    this.dirty = true;

    if (place) {
      let selected: SelectTileBrowserData = null;
      const selectedTileTypeIndex = this.editor.tileBrowser.selectedItem?.tileTypeData.typeIndex;
      const selectedSprite = this.editor.tileBrowser.selectedItem?.spriteData;
      const currentTile = this.getTile(this.selectedTile.j, this.selectedTile.i, this._activeLayer);
      // make sure there is a sprite and it is a different tile
      if (selectedSprite && (!currentTile || currentTile.typeIndex != selectedTileTypeIndex)) {
        selected = new SelectTileBrowserData();
        selected.sx = selectedSprite.tileData.loc[0];
        selected.sy = selectedSprite.tileData.loc[1];
        selected.srcWidth = selectedSprite.tileData.loc[2];
        selected.srcHeight = selectedSprite.tileData.loc[3];
        selected.image = selectedSprite.image;
        selected.offsetX = selectedSprite.tileData.offset[0];
        selected.offsetY = selectedSprite.tileData.offset[1];
        selected.typeIndex = selectedTileTypeIndex;
        selected.spriteIndex = selectedSprite.spriteIndex;

        // flip the sprite if needed
        if (selectedSprite.tileData.flipX && selectedSprite.tileData.flipY) {
          selected.flip = SpriteFlip.FlipBoth;
        } else if (selectedSprite.tileData.flipY) {
          selected.flip = SpriteFlip.FlipY;
        } else if (selectedSprite.tileData.flipX) {
          selected.flip = SpriteFlip.FlipX;
        }

        const location = new TilePlaceLocation(this.selectedTile.j, this.selectedTile.i, this._activeLayer);
        const placeJob = new JobPlaceTile(this.editor, selected, location);

        this.editor.jobManager.execute(placeJob);
      }
    }
  }

  private renderGrid(): void {
    this.ctx.beginPath();

    const stepX = 16;
    const stepY = 16;

    this.ctx.strokeStyle = '#646464';
    this.ctx.fillStyle = '#c4c4c4';
    const maxI = 50;
    const maxJ = 50;
    const kOffset = -this._activeLayer * stepY * 2;
    for (let i = 0; i < this.MaxI; i++) {
      const x1 = -i * stepX * 2;
      const y1 = i * stepY + kOffset;
      const x2 = -i * stepX * 2 + (maxJ - 1) * stepX * 2;
      const y2 = (maxJ - 1) * stepX + i * stepY + kOffset;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    for (let j = 0; j < this.MaxJ; j++) {
      const x1 = j * stepX * 2;
      const y1 = j * stepY + kOffset;
      const x2 = j * stepX * 2 - (maxI - 1) * stepX * 2;
      const y2 = (maxI - 1) * stepX + j * stepY + kOffset;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    this.ctx.stroke();

    if (this.selectedTile.i >= 0 && this.selectedTile.j >= 0) {
      const i = this.selectedTile.i;
      const j = this.selectedTile.j;
      // top
      const p0 = { x: -i * stepX * 2 + j * stepY * 2, y: i * stepX + j * stepY + kOffset };
      // right
      const p1 = { x: -i * stepX * 2 + j * stepY * 2 + stepX * 2, y: i * stepX + j * stepY + stepY + kOffset };
      // left
      const p2 = { x: -i * stepX * 2 + j * stepY * 2 - stepX * 2, y: i * stepX + j * stepY + stepY + kOffset };
      // bottom
      const p3 = { x: -i * stepX * 2 + j * stepY * 2, y: i * stepX + j * stepY + stepY * 2 + kOffset };

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
