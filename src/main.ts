import './style.css';
import { WebGLRenderer } from 'three';
import { MainWorldScene } from './scenes/MainWorldScene';

const canvasElement = document.querySelector<HTMLCanvasElement>('#canvas');
if (!canvasElement) throw new Error('Game canvas was not found');
const canvas: HTMLCanvasElement = canvasElement;

const renderer = new WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const activeScene = new MainWorldScene(renderer);

function resize(): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  activeScene.resize(width, height);
}

new ResizeObserver(resize).observe(canvas);
resize();

let previousTime = performance.now();
function frame(currentTime: number): void {
  const deltaSeconds = Math.min((currentTime - previousTime) / 1000, 0.1);
  previousTime = currentTime;
  activeScene.update(deltaSeconds);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
