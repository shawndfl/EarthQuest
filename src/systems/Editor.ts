import { Component } from '../core/Component';
import { ILevelData } from '../data/ILevelData';

export class Editor extends Component {
  private _2dContext: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  initialize(): void {
    // hide the canvas
    this.eng.canvasGL.style.display = 'none';

    this.canvas = document.getElementById('editor') as HTMLCanvasElement;
    this.canvas.width = this.eng.width;
    this.canvas.height = this.eng.height;
    this.canvas.style.cssText = `
    position: absolute;
    left: 0px;
    top: 0px;
    z-index: 1;
    border: solid 1px;
    height: 100vh;
    `;
    this.canvas.addEventListener('click', (e) => this.onClick(e));
    this._2dContext = this.canvas.getContext('2d');
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
