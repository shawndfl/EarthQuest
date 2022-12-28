import { TextController } from './TextController';
import { IFontData } from './IFontData';
import { ITextModel } from './ITextModel';

/**
 * Vertex shader for Font
 */
const FontVS = `
    #version 330 core

    uniform mat4 u_projection;

    layout (location = 0) in vec3 a_pos;
    layout (location = 1) in vec2 a_tex;

    out vec2 v_tex;
                                                
    void main() {
        gl_Position = u_projection  * vec4(a_pos, 1.0);
        v_tex = a_tex;
    }                          
`;

/**
 * Fragment shader for Font
 */
const FontFS = `
        #version 330 core
                 
        in vec2 v_tex;
        uniform sampler2D u_font;
        uniform vec4 u_color;
        out vec4 color;
                            
        void main() {
            color = texture(u_font, v_tex) * u_color;
        }
`;

/**
 * Font manager keeps track of all FontController objects
 */
export class TextManager {
  texts: TextController[];
  fontData: IFontData;
  fontImage: string;

  constructor(private gl: WebGL2RenderingContext) {
    this.texts = [];
  }

  /**
   * Initialize the font manage. Only one font can be used per manager
   * The font data is a json structure.
   * @param {} fontImage
   * @param {FontData} fontData
   */
  initialize(fontImage: string, fontData: IFontData) {
    this.fontImage = fontImage;
    this.fontData = fontData;

    this.texts = [];
  }

  /**
   * Updates all the TextureController
   * @param {number} dt Delta time in ms
   */
  update(dt: number) {
    this.texts.forEach((text) => {
      text.update(dt);
    });
  }

  addText(textModel: ITextModel) {
    const text = new TextController(this.gl, this.fontData);

    //text.initialize(textModel.text, textModel.position[0])
    //this.texts.push(new )
    console.warn('Implement fontManager');
  }

  /**
   * clean up everything
   */
  dispose() {}
}
