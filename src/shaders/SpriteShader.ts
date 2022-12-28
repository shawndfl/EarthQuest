import { ShaderController } from '../core/ShaderController';
import { Texture } from '../core/Texture';

//
// Vertex Shader program
//
const vsSource = `
attribute vec3 aPos;
attribute vec2 aTex;

varying highp vec2 vTex;

void main() {
    vTex = aTex;
    gl_Position = vec4(aPos.xyz, 1.0);
}
`;

//
// Fragment shader program
//
const fsSource = `
varying highp vec2 vTex;

uniform sampler2D uSampler;

void main() {
    gl_FragColor = texture2D(uSampler, vTex);
}
`;

/**
 * Shader for sprites
 */
export class SpriteShader {
  private _shader: ShaderController;

  private _aPos: number;
  private _aTex: number;
  private _uSampler: number;
  private _texture: Texture;

  constructor(private gl: WebGL2RenderingContext, shaderId: string) {
    this._shader = new ShaderController(this.gl, shaderId);
    this._shader.initShaderProgram(vsSource, fsSource);

    // set the info
    this._aPos = this._shader.getAttribute('aPos');
    this._aTex = this._shader.getAttribute('aTex');
    this._uSampler = this._shader.getUniform('uSampler');
  }

  setSpriteSheet(texture: Texture) {
    this._texture = texture;
  }

  enable() {
    this._shader.enable();

    if (!this._texture) {
      console.warn('texture is null. Call setSpriteSheet()');
    } else {
      // Bind the texture to texture unit 0
      this._texture.enable(this._uSampler);
    }
  }
}
