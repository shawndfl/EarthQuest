export class TextController {
  constructor() {}

  /**
   *
   * @param {FontData} fontData Used to look up character information
   * @param {string} text
   * @param {int} x
   * @param {int} y
   * @param {float} depth Range -1 to 1. -1 is back, 1 is in front
   * @param {float} scale Range .0001 to 1
   * @param {float[4]} color RGBA color
   * @param {int} maxHeight
   * @param {int} width
   * @param {int} height
   */
  initialize(
    fontData,
    text,
    x,
    y,
    depth,
    scale,
    color,
    maxHeight,
    width,
    height
  ) {}
}
