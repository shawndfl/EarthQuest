import { CanvasController } from './core/CanvasController';
import { Scene } from './core/Scene';

import './css/canvas.css';

/**
 * Create the only instance of a canvas controller
 */
const canvas = new CanvasController();
const scene = new Scene(canvas.gl);

scene.init();

/** time tracking variables */
let previousTimeStamp;

function step(timestamp) {
  // save the start time
  if (previousTimeStamp === undefined) {
    previousTimeStamp = timestamp;
  }

  // calculate the elapsed
  const elapsed = timestamp - previousTimeStamp;

  // update the scene
  scene.update(elapsed);

  // request a new frame
  previousTimeStamp = timestamp;
  window.requestAnimationFrame(step);
}

// request a frame
window.requestAnimationFrame(step);

// add the canvas to the body
document.body.appendChild(canvas.component());
