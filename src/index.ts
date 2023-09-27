import { EarthQuestEngine } from './_game/EarthQuestEngine';
import './css/canvas.scss';
/**
 * Create the only instance of a canvas controller
 */
const engine = new EarthQuestEngine();

/** time tracking variables */
let previousTimeStamp: number;
let timeCounter = 0;

function step(timestamp: number) {
  window.requestAnimationFrame(step);

  // save the start time
  if (previousTimeStamp === undefined) {
    previousTimeStamp = timestamp;
  }

  // calculate the elapsed
  const elapsed = timestamp - previousTimeStamp;

  timeCounter += elapsed;
  if (timeCounter > 20.00) {
    // update the scene
    engine.update(timeCounter);
    timeCounter = 0;
  }

  // request a new frame
  previousTimeStamp = timestamp;

}

/**
 * Start the engine then request and animation frame
 */
engine
  .initialize(document.getElementById('rootContainer'))
  .then(() => {
    // request the first frame
    window.requestAnimationFrame(step);
  })
  .catch((e) => {
    console.error('Error initializing ', e);
  });

