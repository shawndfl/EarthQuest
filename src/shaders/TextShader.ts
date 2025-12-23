import { ShaderController } from '../graphics/ShaderController';
import { Texture } from '../graphics/Texture';
import vec4 from '../math/vec4';
import { BaseShader } from './BaseShader';

/**
 * Vertex shader for Font
 */
const vsSource = `
    attribute vec3 aPos;
    attribute vec2 aTex;

    varying mediump vec2 vTex;
                                                
    void main() {
        vTex = aTex;
        gl_Position = vec4(aPos.xyz, 1.0);
    }                          
`;

/**
 * Fragment shader for Font
 */
const fsSource = ` 
      varying mediump vec2 vTex;

      uniform sampler2D uFont;
      uniform mediump vec4 uColor;
                            
      void main() {
        mediump vec4 color = texture2D(uFont, vTex) * uColor;
        if(color.w > 0.2) { 
          gl_FragColor = texture2D(uFont, vTex) * uColor;
        } else {
          discard;
        }
      }
`;

/**
 * This shader is used to draw font
 */
export class TextShader extends BaseShader {
  private _fontTexture: Texture;
  private _aPos: number;
  private _aTex: number;

  private _uFont: number;
  private _uColor: number;

  constructor(gl: WebGL2RenderingContext, shaderId: string) {
    super(gl, shaderId ?? 'fontShader');
    this._shader.initShaderProgram(vsSource, fsSource);

    // set the info
    this._aPos = this._shader.getAttribute('aPos');
    this._aTex = this._shader.getAttribute('aTex');
    this._uFont = this._shader.getUniform('uFont');
    this._uColor = this._shader.getUniform('uColor');
  }

  setFontTexture(texture: Texture): void {
    this._fontTexture = texture;
  }

  setColor(color: vec4): void {
    this._shader.setVec4(this._uColor, color);
  }

  enable(): void {
    super.enable();
    if (!this._fontTexture) {
      console.warn('texture is null. Call setSpriteSheet()');
    } else {
      // Bind the texture to texture unit 0
      this._fontTexture.enable(this._uFont);
    }
  }

  /**
   * clean up everything
   */
  dispose() {
    this._shader.dispose();
  }
}
