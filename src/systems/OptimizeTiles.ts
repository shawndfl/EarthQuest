import { Component } from '../core/Component';
import { ILevelData } from '../data/ILevelData';

import vec4 from '../math/vec4';

export class Block8X8 {
  data: ImageData;

  hash: string;
  skip: boolean;
  constructor() {}

  setPixels(left: number, top: number, data: ImageData): void {
    let hash = 0;

    const destData = [];
    for (let y = top; y < top + 8; y++) {
      for (let x = left; x < left + 8; x++) {
        const destX = x - left;
        const destY = y - top;

        // watch the bounds
        if (x >= data.width || y >= data.height) {
          continue;
        }

        const i = (y * data.width + x) * 4;
        const r = data.data[i];
        const g = data.data[i + 1];
        const b = data.data[i + 2];
        const a = data.data[i + 3];
        destData.push(...[r, g, b, a]);

        // Simple hash: weighted sum
        hash += r * 3 + g * 5 + b * 7;
      }
    }
    // Normalize and stringify hash
    hash = hash % 0xffffffff; // keep it 32-bit
    this.hash = hash.toString(16).padStart(8, '0');

    this.data = new ImageData(new Uint8ClampedArray(destData), 8, 8, { colorSpace: 'srgb' });
  }
}

export class OptimizeTiles extends Component {
  private _2dContext: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  initialize(): void {
    // hide the canvas
    this.eng.canvasGL.style.display = 'none';

    this.canvas = document.getElementById('editor') as HTMLCanvasElement;
    this.canvas.width = this.eng.width;
    this.canvas.height = this.eng.height;
    this.canvas.style.cssText = `
    z-index: 1;
    border: solid 1px;
    height: 100vh;
    `;
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this._2dContext = this.canvas.getContext('2d');

    const input = document.getElementById('imageInput') as HTMLInputElement;

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize canvas to match image
          this.canvas.width = img.width;
          this.canvas.height = img.height;

          // Draw image on canvas
          this._2dContext.drawImage(img, 0, 0);

          const imageData = this._2dContext.getImageData(0, 0, this.canvas.width, this.canvas.height);
          const data = imageData;

          // create all the blocks
          const blockSize = 8;
          const blocks = [];
          //288 X 256
          const blockCount = Math.ceil(this.canvas.width / blockSize) * Math.ceil(this.canvas.height / blockSize);
          for (let i = 0; i < blockCount; i++) {
            blocks.push(new Block8X8());
          }

          // Loop through pixels
          for (let y = 0; y < this.canvas.height; y += blockSize) {
            for (let x = 0; x < this.canvas.width; x += blockSize) {
              const blockIndex = ((y / blockSize) * this.canvas.width) / blockSize + x / blockSize;
              blocks[blockIndex].setPixels(x, y, data);

              //console.debug('block index ' + blockIndex + ' hash ' + blocks[blockIndex].hash);
              // Log RGB values
              //console.log(`Pixel (${x}, ${y}): R=${r}, G=${g}, B=${b}, A=${a}`);
            }
          }

          // check for dupes
          const unique = [];
          for (let i = 0; i < blocks.length; i++) {
            if (blocks[i].skip) {
              continue;
            }
            // save the unique
            unique.push(blocks[i]);
            for (let j = i + 1; j < blocks.length; j++) {
              // if we find a match flag it to be skip
              if (blocks[i].hash == blocks[j].hash) {
                blocks[j].skip = true;
              }
            }
          }
          console.debug(
            'unique ' +
              unique.length +
              ' total ' +
              blocks.length +
              ' savings ' +
              ((unique.length * 100) / blocks.length).toFixed(2) +
              '%'
          );

          this._2dContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
          let index = 0;
          for (let y = 0; y < 256; y += blockSize) {
            for (let x = 0; x < 256; x += blockSize) {
              this._2dContext.putImageData(unique[index++].data, x, y);
            }
          }
        };
        img.src = e.target.result as string; // Data URL
      };

      reader.readAsDataURL(file);
    });
  }

  async loadLevel(): Promise<void> {
    this.refreshScene();
  }

  refreshScene(): void {
    const ctx = this._2dContext;
    const canvasX = this.canvas.width / this.canvas.clientWidth;
    const canvasY = this.canvas.height / this.canvas.clientHeight;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = '#646464';
    ctx.beginPath(); // Start a new path

    ctx.stroke(); // Render the path
  }

  onClick(e: MouseEvent): void {
    const ctx = this._2dContext;
    const canvasX = this.canvas.width / this.canvas.clientWidth;
    const canvasY = this.canvas.height / this.canvas.clientHeight;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = '#646464';
    ctx.beginPath(); // Start a new path
    ctx.rect(e.clientX * canvasX, e.clientY * canvasY, 16, 16);
    ctx.stroke(); // Render the path
  }
}
