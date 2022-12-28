import vec4 from '../math/vec4';
import { IFontData } from './IFontData';
import { ITextModel } from './ITextModel';

export class TextController {
  constructor(
    private gl: WebGL2RenderingContext,
    private fontData: IFontData[]
  ) {}

  /**
   * Initialize a new text block
   * @param block Text properties
   * @param lineHeight The height of the tallest character in pixels
   */
  initialize(block: ITextModel, lineHeight: number) {
    const originX = block.position.x;
    const originY = block.position.y - lineHeight;
    let offsetX = originX;
    let offsetY = originY;
    let xpos1 = offsetX;
    let ypos1 = offsetY;
    let xpos2 = offsetX;
    let ypos2 = offsetY;

    const zpos = block.depth;
    const charCount = 0;
    const text = block.text;

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

      offsetX = xpos2;

      //LOGD("Character " << (int) ch << " = " <<ch);
      //LOGD("offset " << xpos1 << ", " << ypos1 << " to " << xpos2 << ", " << ypos2);

      const tu1 = font.u1;
      const tv1 = font.v2;

      const tu2 = font.u2;
      const tv2 = font.v1;

      //LOGD("texture " << tu1 << ", " << tv1 << " to " << tu2 << ", " << tv2);
      /*
      // top left
      verts.push_back(xpos1);
      verts.push_back(ypos1);
      verts.push_back(zpos);
      verts.push_back(tu1);
      verts.push_back(tv1);

      // top right
      verts.push_back(xpos2);
      verts.push_back(ypos1);
      verts.push_back(zpos);
      verts.push_back(tu2);
      verts.push_back(tv1);

      // bottom right
      verts.push_back(xpos2);
      verts.push_back(ypos2);
      verts.push_back(zpos);
      verts.push_back(tu2);
      verts.push_back(tv2);

      // bottom left
      verts.push_back(xpos1);
      verts.push_back(ypos2);
      verts.push_back(zpos);
      verts.push_back(tu1);
      verts.push_back(tv2);

      indices.push_back(charCount * 4 + 0);
      indices.push_back(charCount * 4 + 1);
      indices.push_back(charCount * 4 + 3);

      indices.push_back(charCount * 4 + 1);
      indices.push_back(charCount * 4 + 2);
      indices.push_back(charCount * 4 + 3);

      charCount++;
      */
    }
  }

  /**
   * Updates the text animations.
   * @param {float} dt Delta time in ms
   */
  update(dt: number) {}
}
