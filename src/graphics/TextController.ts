import { Component } from '../components/Component';
import vec4 from '../math/vec4';
import { Engine } from '../core/Engine';
import { GlBuffer, IQuadModel } from './GlBuffer';
import { IFontData } from './IFontData';
import { ITextModel } from './ITextModel';

export class TextController extends Component {
  buffer: GlBuffer;
  color: vec4;

  constructor(eng: Engine, private fontData: IFontData[]) {
    super(eng);
    // Create a new buffer
    this.buffer = new GlBuffer(this.gl);
  }

  /**
   * Initialize a new text block
   * @param block Text properties
   * @param lineHeight The height of the tallest character in pixels
   */
  initialize(
    block: ITextModel,
    lineHeight: number,
    screenWidth: number,
    screenHeight: number
  ) {
    const originX = block.position.x;
    const originY = block.position.y - lineHeight;
    let offsetX = originX;
    let offsetY = originY;
    let xpos1 = offsetX;
    let ypos1 = offsetY;
    let xpos2 = offsetX;
    let ypos2 = offsetY;

    this.color = block.color;
    const zpos = block.depth;
    let charCount = 0;
    const text = block.text;
    const quads: IQuadModel[] = [];

    // loop over all the characters in the text block
    // and create geometry for them.
    for (let i = 0; i < text.length; i++) {
      // get the character
      let ch = text.charAt(i);

      // check for new line and out of range
      if (ch == '\n') {
        offsetY -= lineHeight;
        offsetX = originX;
        continue;
      } else if (ch < ' ' || ch > '~') {
        ch = '?';
      }

      const font = this.fontData.find((value) => value.ch == ch);

      if (!font) {
        console.warn("Don't have data for ch: " + ch);
      }

      xpos1 = offsetX + block.scale * font.bearingX;
      ypos1 = offsetY - block.scale * (font.sizeY - font.bearingY); // bottom of the letter

      xpos2 = offsetX + block.scale * font.advance;
      ypos2 = offsetY + block.scale * font.bearingY; // top of the letter

      // set for the next letter
      offsetX = xpos2;

      const tu1 = font.u1;
      const tv1 = 1 - font.v2;
      const tu2 = font.u2;
      const tv2 = 1 - font.v1;

      const quad: IQuadModel = {
        min: [xpos1 / screenWidth, ypos1 / screenHeight, zpos],
        max: [xpos2 / screenWidth, ypos2 / screenHeight, zpos],
        minTex: [tu1, tv2],
        maxTex: [tu2, tv1],
      };

      charCount++;

      quads.push(quad);
    }

    this.buffer.setBuffers(quads, false);
  }

  /**
   * Updates the text animations.
   * @param {float} dt Delta time in ms
   */
  update(dt: number) {
    // enable the buffer
    this.buffer.enable();

    {
      const vertexCount = this.buffer.indexCount;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}
