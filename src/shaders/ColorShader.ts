import { ShaderController } from '../graphics/ShaderController';
import mat4 from '../math/mat4';

//
// Vertex Shader program
//
const vsSource = `
precision mediump float;

attribute vec3 aPos;
attribute vec4 aColor;

uniform mat4 uProj;
varying vec4 vColor;

void main() {
    vec4 pos = uProj * vec4(aPos.xyz, 1.0);
    gl_Position = pos;
    vColor = aColor;
}
`;

//
// Fragment shader program
//
const fsSource = `
precision mediump float;

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`;

/**
 * Shader for sprites
 */
export class ColorShader {
  private _shader: ShaderController;

  private _aPos: number;
  private _aColor: number;
  private _uProj: number;

  constructor(private gl: WebGL2RenderingContext, shaderId: string) {
    this._shader = new ShaderController(this.gl, shaderId);
    this._shader.initShaderProgram(vsSource, fsSource);

    // set the info
    this._aPos = this._shader.getAttribute('aPos');
    this._aColor = this._shader.getAttribute('aColor');
    this._uProj = this._shader.getUniform('uProj');
  }

  setProj(proj: mat4): void {
    this._shader.setMat4(this._uProj, proj);
  }

  enable(): void {
    this._shader.enable();
  }
}
