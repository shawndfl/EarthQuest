import { TextController } from './TextController';

/**
 * Font data that tells the FontController how to position the vertices
 * and what the uv coordinates would be.
 */
class FontData {
  constructor() {
    /** @type {string} The ascii character */
    this.ch = '';
    /**  The int value of the ascii character */
    this.value = undefined;
    /** Size of the character */
    this.sizeX = undefined;
    /** Size of the character */
    this.sizeY = undefined;
    /** Offset of the character */
    this.bearingX = undefined;
    /** Offset of the character */
    this.bearingY = undefined;
    /** Where to draw the next character */
    this.advance = undefined;
    /** uv coordinates for the character in the texture */
    this.u1 = undefined;
    this.v1 = undefined;
    /** uv coordinates for the character in the texture */
    this.u2 = undefined;
    this.v2 = undefined;
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
   * @param {} fontImage
   * @param {FontData} fontData
   */
  initialize(fontImage, fontData) {
    this.fontImage = fontImage;
    this.fontData = fontData;

    const text = new TextController();
    //text.initialize();
    this.texts.push(text);

    console.warn('Implement fontManager');
  }

  /**
   * Updates all the TextureController
   * @param {number} dt Delta time in ms
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
