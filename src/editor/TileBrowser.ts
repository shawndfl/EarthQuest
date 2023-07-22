import '../css/TileBrowser.scss';
import TileImage from '../assets/isometricTile.png';
import CharacterImage from '../assets/characters.png';
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

export interface TileImageSrc {
  src: string;
  w: number;
  h: number;
}

/**
 * The loaded image with the tile's width and height
 */
export interface TileImageElement {
  img: HTMLImageElement;
  w: number;
  h: number;
}

export class TileBrowser extends EditorComponent {
  container: HTMLElement;
  tileCanvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  images: TileImageElement[];
  activeImage: number;
  ready: boolean;

  private canvasScale: number;
  private invCanvasScale: number;
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
      var rect = this.tileCanvas.getBoundingClientRect();
      const scaleX = this.tileCanvas.width / rect.width; // relationship bitmap vs. element for x
      const scaleY = this.tileCanvas.height / rect.height; // relationship bitmap vs. element for y

      this.selectionPoint = { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
      this.refreshCanvas();
    });

    this.context = this.tileCanvas.getContext('2d');
    this.activeImage = -1;
    this.setZoom(2.0);
  }

  /**
   * Create the view for the tile browser
   */
  private createView() {
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('tile-browser-button-group');

    const divNext = document.createElement('div');
    divNext.innerHTML = '>';
    divNext.classList.add('btn');
    divNext.addEventListener('click', () => {
      if (this.ready) {
        this.activeImage = Math.min(++this.activeImage, this.images.length);
        this.refreshCanvas();
      }
    });

    const divPrev = document.createElement('div');
    divPrev.innerHTML = '<';
    divPrev.classList.add('btn');
    divPrev.addEventListener('click', () => {
      if (this.ready) {
        this.activeImage = Math.max(--this.activeImage, 0);
        this.refreshCanvas();
      }
    });

    buttonGroup.append(divPrev, divNext);

    this.container.append(buttonGroup);
  }

  /**
   * Loads an tile image. This is called from loadTiles()
   * @param resolve The promise resolve function
   * @param img The html image element
   * @param tileImageSrc Source image data
   */
  async loadImage(
    resolve: (value: HTMLImageElement) => void,
    img: HTMLImageElement,
    tileImageSrc: TileImageSrc
  ): Promise<void> {
    img.onload = () => {
      const tileImage: TileImageElement = { img, w: tileImageSrc.w, h: tileImageSrc.h };
      this.images.push(tileImage);

      resolve(img);
    };
    img.src = tileImageSrc.src;
  }

  /**
   * Loads all the tiles into memory. Once this is done the
   * user will be able to switch between tiles sets.
   */
  async loadTiles(): Promise<void> {
    const promises = [];
    const imgSrc: TileImageSrc[] = [
      { src: TileImage, w: 32, h: 32 },
      { src: CharacterImage, w: 16, h: 24 },
    ];

    this.images = [];

    for (let i = 0; i < imgSrc.length; i++) {
      promises.push(
        new Promise((resolve) => {
          const img = new Image();
          this.loadImage(resolve, img, imgSrc[i]);
        })
      );
    }

    Promise.all(promises).then((images: HTMLImageElement[]) => {
      this.activeImage = 0;
      this.refreshCanvas();
      this.ready = true;
      this.container.append(this.tileCanvas);
    });
  }

  buildHtml(): HTMLElement {
    this.container = document.createElement('div');
    this.container.classList.add('editor-tile-browser');
    this.loadTiles();
    this.createView();
    return this.container;
  }

  /**
   * Sets the zoom factor
   * @param value
   */
  setZoom(value: number) {
    this.canvasScale = Math.min(Math.max(value, 0.0), 5.0);
    this.invCanvasScale = 1 / this.canvasScale;
  }

  /**
   * redraws the canvas with the correct image
   */
  refreshCanvas(): void {
    const ctx = this.context;

    // get the active image
    const imgData = this.images[this.activeImage];

    this.tileCanvas.width = imgData.img.naturalWidth;
    this.tileCanvas.height = imgData.img.naturalHeight;
    ctx.clearRect(0, 0, this.tileCanvas.width, this.tileCanvas.height);
    ctx.scale(this.canvasScale, this.canvasScale);
    ctx.drawImage(imgData.img, 0, 0);
    const tileW = imgData.w;
    const tileH = imgData.h;

    if (this.selectionPoint) {
      const x = Math.floor((this.selectionPoint.x * this.invCanvasScale) / tileW) * tileW;
      const y = Math.floor((this.selectionPoint.y * this.invCanvasScale) / tileH) * tileH;
      const w = tileW;
      const h = tileH;

      this.selectionRect = { x, y, w, h };

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00ff0064';
      ctx.rect(x, y, w, h);
      ctx.stroke();
    }
  }
}
