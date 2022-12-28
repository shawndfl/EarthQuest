import { Texture } from '../core/Texture';
import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import { ShaderController } from '../core/ShaderController';

const vsSource = `
    attribute vec3 aPos;
    attribute vec2 aTex;

    varying highp vec2 vTex;

    void main() {
        vTex = aTex;
        gl_Position = vec4(aPos.xyz, 1.0);
    }
`;

// Fragment shader program

const fsSource = `
    varying highp vec2 vTex;

    uniform sampler2D uSampler;

    void main() {
        gl_FragColor = texture2D(uSampler, vTex);
    }
`;

export class Ground {
  private _texture: Texture;
  private _buffer: GlBuffer;

  constructor(private gl: WebGL2RenderingContext) {
    this._buffer = new GlBuffer(this.gl);
  }

  initialize(texture: Texture) {}

  update(dt: number) {}
}
