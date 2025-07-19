import { ShaderController } from '../graphics/ShaderController';
import { Texture } from '../graphics/Texture';
import mat4 from '../math/mat4';

//
// Vertex Shader program
//
const vsSource = `
attribute vec3 aPos;
attribute vec2 aTex;
attribute float aHueAngle;
attribute float aAlpha;

uniform mat4 uProj;
varying mediump vec2 vTex;
varying mediump vec3 depth;
varying mediump float hueAngle;
varying mediump float alpha;

void main() {
    vTex = aTex;
    vec4 pos = uProj * vec4(aPos.xyz, 1.0);
    gl_Position =  pos;
    depth = vec3(pos.z *.1);
    hueAngle = aHueAngle;
    alpha = aAlpha;
}
`;

//
// Fragment shader program
//
const fsSource = `
varying mediump vec2 vTex;
varying mediump vec3 depth;
varying mediump float hueAngle;
varying mediump float alpha;
uniform sampler2D uSampler;

mediump vec4 hueShift(mediump vec4 color) {
  const mediump vec4  kRGBToYPrime = vec4 (0.299, 0.587, 0.114, 0.0);
  const mediump vec4  kRGBToI     = vec4 (0.596, -0.275, -0.321, 0.0);
  const mediump vec4  kRGBToQ     = vec4 (0.212, -0.523, 0.311, 0.0);

  const mediump vec4  kYIQToR   = vec4 (1.0, 0.956, 0.621, 0.0);
  const mediump vec4  kYIQToG   = vec4 (1.0, -0.272, -0.647, 0.0);
  const mediump vec4  kYIQToB   = vec4 (1.0, -1.107, 1.704, 0.0);

  // Convert to YIQ
  mediump float   YPrime  = dot (color, kRGBToYPrime);
  mediump float   I      = dot (color, kRGBToI);
  mediump float   Q      = dot (color, kRGBToQ);

  // Calculate the hue and chroma
  mediump float   hue     = atan (Q, I);
  mediump float   chroma  = sqrt (I * I + Q * Q);

  // Make the user's adjustments
  hue += hueAngle;

  // Convert back to YIQ
  Q = chroma * sin (hue);
  I = chroma * cos (hue);

  // Convert back to RGB
  mediump vec4    yIQ   = vec4 (YPrime, I, Q, 0.0);
  color.r = dot (yIQ, kYIQToR);
  color.g = dot (yIQ, kYIQToG);
  color.b = dot (yIQ, kYIQToB);
  return color;
}

void main() {
  mediump vec3 axis = vec3(1.0/sqrt(3.0));
  mediump float angle = 30.0;
  mediump vec4 color = texture2D(uSampler, vTex);
  if(color.a < .0001) {
    discard;
  } 

  // uncomment to show depth
  //gl_FragColor = vec4(depth.xyz, 1.0);
  color = hueShift(color);
  color.a *= alpha;
  gl_FragColor = color;

}
`;

/**
 * Shader for sprites
 */
export class SpritePerspectiveShader {
  private _shader: ShaderController;

  private _aPos: number;
  private _aTex: number;
  private _aHueAngle: number;
  private _aAlpha: number;
  private _uSampler: number;
  private _texture: Texture;
  private _uProj: number;

  constructor(private gl: WebGL2RenderingContext, shaderId: string) {
    this._shader = new ShaderController(this.gl, shaderId);
    this._shader.initShaderProgram(vsSource, fsSource);

    // set the info
    this._aPos = this._shader.getAttribute('aPos');
    this._aTex = this._shader.getAttribute('aTex');
    this._aHueAngle = this._shader.getAttribute('aHueAngle');
    this._aAlpha = this._shader.getAttribute('aAlpha');

    this._uSampler = this._shader.getUniform('uSampler');
    this._uProj = this._shader.getUniform('uProj');
  }

  setProj(proj: mat4): void {
    this._shader.setMat4(this._uProj, proj);
  }

  setSpriteSheet(texture: Texture): void {
    this._texture = texture;
  }

  enable(): void {
    this._shader.enable();
    if (!this._texture) {
      console.warn('texture is null. Call setSpriteSheet()');
    } else {
      // Bind the texture to texture unit 0
      this._texture.enable(this._uSampler);
    }
  }
}
