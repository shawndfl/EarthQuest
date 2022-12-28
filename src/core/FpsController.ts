import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { TextManager } from './TextManager';

/**
 * Shows the FPS
 */
export class FpsController {
  fps: number;
  delayCounter: number;
  displayInterval: number;

  constructor(private textManager: TextManager) {
    /** The frames per second (float) */
    this.fps = 0;
    /** Just a counter for displaying FPS to the console */
    this.delayCounter = 0;
    /** Show the FPS every second */
    this.displayInterval = 1000;
  }

  /**
   * Calculate the FPS
   * @param {float} dt delta time in ms
   */
  update(dt: number) {
    this.fps = 1000.0 / dt;
    this.delayCounter += dt;
    if (this.delayCounter >= this.displayInterval) {
      //console.debug('ms ' + dt.toFixed(2) + ' FPS: ' + this.fps.toFixed(2));
      this.textManager.setTextBlock({
        id: 'FPS',
        text: 'ms ' + dt.toFixed(2) + ' FPS: ' + this.fps.toFixed(2),
        position: new vec2([250, 600]),
        color: new vec4([0.1, 0.5, 0.3, 1.0]),
        depth: -1,
        scale: 0.5,
      });
      this.delayCounter = 0;
    }
  }
}
