import '../css/TileBrowser.css';
import TileImage from '../assets/isometricTile.png';
import rect from '../math/rect';
import { EditorComponent } from './EditorComponent';
import { Editor } from './Editor';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class TileBrowser extends EditorComponent {
  container: HTMLElement;
  tileCanvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
  ready: boolean;

  readonly CanvasScale = 2.0;
  readonly InvCanvasScale = 1 / this.CanvasScale;
  private selectionPoint: Point;
  private selectionRect: Rect;

  get selectedTile(): Rect | undefined {
    return this.selectionRect;
  }

  constructor(editor: Editor) {
    super(editor);
    this.tileCanvas = document.createElement('canvas');
    this.tileCanvas.classList.add('editor-tile-image');
    this.tileCanvas.addEventListener('click', (e: MouseEvent) => {
      this.selectionPoint = { x: e.offsetX, y: e.offsetY };
      this.refreshCanvas();
      console.debug('canvas click', e);
    });
    this.context = this.tileCanvas.getContext('2d');
  }

  loadTiles(): void {
    this.image = new Image();
    this.image.onload = () => {
      this.tileCanvas.width = this.image.naturalWidth;
      this.tileCanvas.height = this.image.naturalHeight;

      this.context.scale(this.CanvasScale, this.CanvasScale);
      this.ready = true;
      this.refreshCanvas();
    };

    this.image.src = TileImage;
    this.container.append(this.tileCanvas);
  }

  buildHtml(): HTMLElement {
    this.container = document.createElement('div');
    this.container.classList.add('editor-tile-browser');
    this.loadTiles();
    return this.container;
  }

  refreshCanvas(): void {
    const ctx = this.context;

    ctx.clearRect(0, 0, this.tileCanvas.width, this.tileCanvas.height);
    const imageMargins = 10;
    ctx.drawImage(this.image, imageMargins, imageMargins);
    if (this.selectionPoint) {
      const x = Math.floor((this.selectionPoint.x * this.InvCanvasScale) / 32) * 32 + imageMargins;
      const y = Math.floor((this.selectionPoint.y * this.InvCanvasScale) / 32) * 32 + imageMargins;
      const w = 32;
      const h = 32;

      this.selectionRect = { x, y, w, h };

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00ff0064';
      ctx.rect(x, y, w, h);
      ctx.stroke();
    }
  }
}
