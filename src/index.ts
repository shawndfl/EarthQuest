import { CanvasController } from './core/CanvasController';
import { Engine } from './core/Engine';
import './css/canvas.css';

/**
 * Create the only instance of a canvas controller
 */
const canvas = new CanvasController(onResize);
const engine = new Engine(canvas.gl);

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

/**
 * Start the engine then request and animation frame
 */
engine
  .initialize()
  .then(() => {
    // request the first frame
    window.requestAnimationFrame(step);
  })
  .catch((e) => {
    console.error('Error initializing ', e);
  });

// add the canvas to the body
document.body.appendChild(canvas.element());
