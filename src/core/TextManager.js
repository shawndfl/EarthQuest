import { TextController } from './TextController';

/**
 * Font data that tells the FontController how to position the vertices
 * and what the uv coordinates would be.
 */
class FontData {
  constructor() {
    /** The ascii character */
    this.ch;
    /**  The int value of the ascii character */
    this.value;
    /** Size of the character */
    this.sizeX;
    /** Size of the character */
    this.sizeY;
    /** Offset of the character */
    this.bearingX;
    /** Offset of the character */
    this.bearingY;
    /** Where to draw the next character */
    this.advance;
    /** uv coordinates for the character in the texture */
    this.u1;
    this.v1;
    /** uv coordinates for the character in the texture */
    this.u2;
    this.v2;
  }
}

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
  constructor() {
    /** Collection of TextController to render  */
    this.texts = [];
    /** FontData object */
    this.fontData;
    /** png image that contains the characters of the font */
    this.fontImage;
  }

  /**
   * Initialize the font manage. Only one font can be used per manager
   * The font data is a json structure.
   * @param {png image} fontImage
   * @param {FontData} fontData
   */
  initialize(fontImage, fontData) {
    this.fontImage = fontImage;
    this.fontData = fontData;

    const font = new TextController();
    font.initialize();
    this.fonts.push(font);

    console.warn('Implement fontManager');
  }

  /**
   * Updates all the TextureController
   * @param {float} dt Delta time in ms
   */
  update(dt) {
    this.texts.forEach((text) => {
      text.update(dt);
    });
  }

  addFont(FontModel) {}

  /**
   * clean up everything
   */
  dispose() {}
}
