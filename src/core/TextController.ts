import { IFontData } from './IFontData';

export class TextController {
  constructor(
    private gl: WebGL2RenderingContext,
    private fontData: IFontData
  ) {}

  /**
   *
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
    text: string,
    x: number,
    y: number,
    depth: number,
    scale: number,
    color: number[],
    maxHeight: number,
    width: number,
    height: number
  ) {}

  /**
   * Updates the text animations.
   * @param {float} dt Delta time in ms
   */
  update(dt: number) {}
}
