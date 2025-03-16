import { SpriteFlip } from '../graphics/Sprite';
import { SelectTileBrowserData } from './JobPlaceTile';

export class FlipCanvas {
  private _canvas: HTMLCanvasElement;
  private _context: CanvasRenderingContext2D;

  constructor() {
    this._canvas = document.createElement('canvas');

    this._context = this._canvas.getContext('2d');
  }

  async flipImage(data: SelectTileBrowserData): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const ctx = this._context;

      const img = data.image;
      const x = data.sx;
      const y = data.sy;
      const w = data.srcWidth;
      const h = data.srcHeight;

      this._canvas.width = w;
      this._canvas.height = h;

      // Use the identity matrix while clearing the canvas
      ctx.clearRect(0, 0, w, h);

      // transform
      //ctx.setTransform(-1, 0, 0, -1, 0, 0);
      if (data.flip == SpriteFlip.FlipBoth) {
        ctx.scale(-1, -1);
        ctx.translate(-w, -h);
      } else if (data.flip == SpriteFlip.FlipX) {
        ctx.scale(-1, 1);
        ctx.translate(-w, 0);
      } else if (data.flip == SpriteFlip.FlipY) {
        ctx.scale(1, -1);
        ctx.translate(0, -h);
      }

      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      const flipped = new Image(w, h);
      flipped.id = 'sample';
      flipped.onload = () => {
        // because we have a new image the
        // source offsets are now 0,0
        data.sx = 0;
        data.sy = 0;
        return resolve(flipped);
      };
      flipped.onerror = () => {
        console.log('image error');
        return reject();
      };
      flipped.src = this._canvas.toDataURL();
    });
  }
}
