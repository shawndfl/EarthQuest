import { Component } from '../../core/Component';
import { Engine } from '../../core/Engine';
import { DrawingLayer } from '../../drawingLayers/DrawingLayer';
import vec2 from '../../math/vec2';
import vec3 from '../../math/vec3';
import { DialogIcon } from './DialogIcon';

export interface CursorNavigation {
  index: number;
}
export interface ListBoxItem {
  text: string;
  location: vec2;
  index: number;
}

export class ListBox extends Component {
  protected items: ListBoxItem[][];
  protected _cursor: DialogIcon;
  selectedRow: number = 0;
  selectedColumn: number = 0;

  get cursor(): DialogIcon {
    return this._cursor;
  }
  get selectedItem(): string {
    return this.items[this.selectedRow]?.[this.selectedColumn]?.text;
  }

  constructor(eng: Engine, protected drawingLayer: DrawingLayer) {
    super(eng);
  }

  initialize(items: ListBoxItem[][]): void {
    this.items = items;
    this.selectedRow = 0;
    this.selectedColumn = 0;
    this.setupCursor();
  }

  protected setupCursor(): void {
    this._cursor = new DialogIcon(this.eng, this.drawingLayer);
  }

  update(dt: number): void {
    if (!this.cursor) {
      return;
    }

    const item = this.items[this.selectedRow]?.[this.selectedColumn];
    if (!item) {
      return;
    }

    this.cursor.setTileTransform({
      position: new vec3(item.location.x, item.location.y, 0),
    });
    this.cursor.update(dt);
  }
}
