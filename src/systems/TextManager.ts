import { IFontData } from '../graphics/IFontData';
import { ITextModel } from '../graphics/ITextModel';
import { Texture } from '../graphics/Texture';
import { Engine } from '../core/Engine';
import { Component } from '../core/Component';
import { TextController } from '../core/TextController';
import { TextShader } from '../shaders/TextShader';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';

/**
 * Font manager keeps track of all FontController objects
 */
export class TextManager extends Component {
  texts: Map<string, TextController>;
  fontData: IFontData[];
  private maxHeightOfCharacters: number;
  shader: TextShader;
  fontTexture: Texture;

  get lineHeight(): number {
    return this.maxHeightOfCharacters;
  }

  constructor(eng: Engine) {
    super(eng);
    this.texts = new Map<string, TextController>();
  }

  /**
   * Initialize the font manage. Only one font can be used per manager
   * The font data is a json structure.
   * @param {} fontImage
   * @param {FontData} fontData
   */
  async initialize(): Promise<void> {
    this.shader = new TextShader(this.eng.gl, 'text');
    this.fontData = FontData;
    this.fontTexture = new Texture(this.eng.gl);
    await this.fontTexture.loadImage(FontImage);
    this.shader.setFontTexture(this.fontTexture);

    // find the tallest character. This will be used when calculating new lines
    this.maxHeightOfCharacters = 0;
    this.fontData.forEach((value) => {
      if (value.sizeY > this.maxHeightOfCharacters) {
        this.maxHeightOfCharacters = value.sizeY;
      }
    });

    // reset the text controllers
    this.texts.clear();
  }

  /**
   * Get text size of a given string
   * @param text
   * @returns
   */
  getTextSize(text: string): { width: number; height: number } {
    if (!text || this.maxHeightOfCharacters == 0) {
      return { width: 0, height: 0 };
    }

    let width = 0;
    let offsetX = 0;
    let height = this.maxHeightOfCharacters;
    for (let i = 0; i < text.length; i++) {
      let ch = text[i];
      if (ch == '\n') {
        offsetX = 0;
        height += this.maxHeightOfCharacters;
      } else if (ch < ' ' || ch > '~') {
        ch = '?';
      }

      const font = this.fontData.find((value) => value.ch == ch);

      if (!font) {
        console.warn("Don't have data for ch: " + ch);
        continue;
      }

      offsetX += font.advance;
    }

    return { width: offsetX, height };
  }

  /**
   * Updates all the TextureController
   * @param {number} dt Delta time in ms
   */
  update(dt: number) {
    // enable the shader
    this.shader.enable();

    this.texts.forEach((text) => {
      this.shader.setColor(text.color);
      text.update(dt);
    });
  }

  /**
   * Hide a text
   * @param id
   */
  hideText(id: string) {
    this.texts.delete(id);
  }

  setTextBlock(textModel: ITextModel) {
    let controller = this.texts.get(textModel.id);

    // create one if needed
    if (!controller) {
      controller = new TextController(this.eng, this.fontData);
      this.texts.set(textModel.id, controller);
    }

    controller.initialize(textModel, this.maxHeightOfCharacters);
  }

  /**
   * clean up everything
   */
  dispose() {
    this.shader.dispose();
  }

  closeLevel(): void {
    // reset the text controllers
    this.texts.forEach((t) => t.dispose());
    this.texts.clear();
  }
}
