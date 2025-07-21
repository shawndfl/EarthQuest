import { ShaderController } from '../graphics/ShaderController';
import { Texture } from '../graphics/Texture';
import mat4 from '../math/mat4';

//
// Vertex Shader program
//
const vsSource = `
precision mediump float;

attribute vec3 aPos;
attribute vec2 aTex;
attribute float aHueAngle;
attribute float aAlpha;

uniform mat4 uProj;
varying vec2 vTex;
varying vec3 depth;
varying float hueAngle;
varying float alpha;

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
precision mediump float;

varying vec2 vTex;
varying vec3 depth;
varying float hueAngle;
varying float alpha;
uniform sampler2D uSampler;

vec3 hue2rgb(vec3 hsv) {
  float hue = fract(hsv.x); //only use fractional part of hue, making it loop
  float r = abs(hsv.x * 6. - 3.) - 1.; //red
  float g = 2. - abs(hsv.x * 6. - 2.); //green
  float b = 2. - abs(hsv.x * 6. - 4.); //blue
  vec3 rgb = vec3(r,g,b); //combine components
  rgb = clamp(rgb, 0., 1.); //clamp between 0 and 1

  rgb = mix( rgb, vec3(1.), hsv.y); //apply saturation
  rgb = rgb * hsv.z; //apply value
  
  return rgb;
}

vec3 rgb2hsv(vec3 rgb) {
  float maxComponent = max(rgb.r, max(rgb.g, rgb.b));
  float minComponent = min(rgb.r, min(rgb.g, rgb.b));
  float diff = maxComponent - minComponent;
  float hue = 0.;
  if(maxComponent == rgb.r) {
      hue = 0.+(rgb.g-rgb.b)/diff;
  } else if(maxComponent == rgb.g) {
      hue = 2.+(rgb.b-rgb.r)/diff;
  } else if(maxComponent == rgb.b) {
      hue = 4.+(rgb.r-rgb.g)/diff;
  }
  hue = fract(hue / 6.);
  float saturation = diff / maxComponent;
  float value = maxComponent;
  return vec3(hue, saturation, value);
}

vec4 hueShift(vec4 color) {
  const vec4  kRGBToYPrime = vec4 (0.299, 0.587, 0.114, 0.0);
  const vec4  kRGBToI     = vec4 (0.596, -0.275, -0.321, 0.0);
  const vec4  kRGBToQ     = vec4 (0.212, -0.523, 0.311, 0.0);

  const vec4  kYIQToR   = vec4 (1.0, 0.956, 0.621, 0.0);
  const vec4  kYIQToG   = vec4 (1.0, -0.272, -0.647, 0.0);
  const vec4  kYIQToB   = vec4 (1.0, -1.107, 1.704, 0.0);

  // Convert to YIQ
  float   YPrime  = dot (color, kRGBToYPrime);
  float   I      = dot (color, kRGBToI);
  float   Q      = dot (color, kRGBToQ);

  // Calculate the hue and chroma
  float   hue     = atan (Q, I);
  float   chroma  = sqrt (I * I + Q * Q);

  // Make the user's adjustments
  hue += hueAngle;

  // Convert back to YIQ
  Q = chroma * sin (hue);
  I = chroma * cos (hue);

  // Convert back to RGB
  vec4    yIQ   = vec4 (YPrime, I, Q, 0.0);
  color.r = dot (yIQ, kYIQToR);
  color.g = dot (yIQ, kYIQToG);
  color.b = dot (yIQ, kYIQToB);
  return color;
}

void main() {
  vec3 axis = vec3(1.0/sqrt(3.0));
  float angle = 30.0;
  vec4 color = texture2D(uSampler, vTex);
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
