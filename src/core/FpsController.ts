/**
 * Shows the FPS
 */
export class FpsController {
  fps: number;
  delayCounter: number;
  displayInterval: number;

  constructor() {
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
  update(dt:number) {
    this.fps = 1000.0 / dt;
    this.delayCounter += dt;
    if (this.delayCounter >= this.displayInterval) {
      console.debug('ms ' + dt.toFixed(2) + ' FPS: ' + this.fps.toFixed(2));
      this.delayCounter = 0;
    }
  }
}
