import { CanvasController } from './core/CanvasController';
import { Engine } from './core/Engine';
import './css/canvas.css';

/**
 * Create the only instance of a canvas controller
 */
const canvas = new CanvasController(onResize);
const engine = new Engine(canvas.gl);

/**
 * Start the engine
 */
engine.initialize();

/**
 * Handle resize
 * @param width
 * @param height
 */
function onResize(width: number, height: number) {
  engine.resize(width, height);
}

/** time tracking variables */
let previousTimeStamp: number;

function step(timestamp: number) {
  // save the start time
  if (previousTimeStamp === undefined) {
    previousTimeStamp = timestamp;
  }

  // calculate the elapsed
  const elapsed = timestamp - previousTimeStamp;

  // update the scene
  engine.update(elapsed);

  // request a new frame
  previousTimeStamp = timestamp;
  window.requestAnimationFrame(step);
}

// request a frame
window.requestAnimationFrame(step);

// add the canvas to the body
document.body.appendChild(canvas.element());
