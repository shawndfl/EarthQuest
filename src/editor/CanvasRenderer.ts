import rect from '../math/rect';
import vec2 from '../math/vec2';
import * as MathConst from '../math/constants';

/**
 * Render to the canvas editor
 */
export class CanvasRenderer {
  ctx: CanvasRenderingContext2D;
  maxScale: number;
  minScale: number;
  scale: number;
  offset: vec2;
  offsetBounds: rect;

  constructor() {
    this.offsetBounds = new rect([-500, -500, 2000, 2000]);
    this.scale = 1;
    this.minScale = 0.3;
    this.maxScale = 4;
    this.offset = new vec2(500, 100);
  }

  render(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.ctx.lineWidth = 1;

    // Store the current transformation matrix
    //context.save();

    // reset transform
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Use the identity matrix while clearing the canvas
    //context.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Restore the transform
    //context.restore();

    this.renderGrid();
  }

  setScale(value: number) {
    this.scale = MathConst.clamp(value, this.minScale, this.maxScale);
    console.debug('scale ' + this.scale.toFixed(4));
  }

  setOffset(value: vec2) {
    this.offset.x = MathConst.clamp(value.x, this.offsetBounds.left, this.offsetBounds.right);
    this.offset.y = MathConst.clamp(value.y, this.offsetBounds.top, this.offsetBounds.bottom);
  }

  private renderGrid() {
    this.ctx.translate(this.offset.x, this.offset.y);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.beginPath();

    const stepX = 16;
    const stepY = 16;

    this.ctx.fillStyle = '#000000';
    const maxI = 100;
    const maxJ = 100;
    for (let i = 0; i < maxI; i++) {
      const x1 = -i * stepX * 2;
      const y1 = i * stepY;
      const x2 = -i * stepX * 2 + (maxJ - 1) * stepX * 2;
      const y2 = (maxJ - 1) * stepX + i * stepY;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    for (let j = 0; j < maxJ; j++) {
      const x1 = j * stepX * 2;
      const y1 = j * stepY;
      const x2 = j * stepX * 2 - (maxI - 1) * stepX * 2;
      const y2 = (maxI - 1) * stepX + j * stepY;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    this.ctx.stroke();
  }
}
