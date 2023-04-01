/**
 * Render to the canvas editor
 */
export class CanvasRenderer {
  ctx: CanvasRenderingContext2D;

  render(context: CanvasRenderingContext2D) {
    this.ctx = context;
    this.ctx.lineWidth = 1;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.renderGrid();
  }

  private renderGrid() {
    const w = this.ctx.canvas.width;
    const h = this.ctx.canvas.height;
    const padding = 20;
    const stepX = 16;
    const stepY = 16;

    this.ctx.fillStyle = '#000000';
    const maxI = 10;
    const maxJ = 10;
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
