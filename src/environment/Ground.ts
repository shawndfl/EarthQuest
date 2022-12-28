import { Texture } from '../core/Texture';
import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import vec2 from '../math/vec2';
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
  private _shader: ShaderController;
  private _shaderInfo: {
    attr: { aPos: number; aTex: number };
    uniform: { uSampler: number };
  };

  constructor(private gl: WebGL2RenderingContext) {
    this._buffer = new GlBuffer(this.gl);
    this._shader = new ShaderController(this.gl, 'ground');
  }

  buildQuad(params: number[]): IQuadModel {
    return {
      min: [params[0], params[1]],
      max: [params[2], params[3]],
      depth: 0.8,
      minTex: [params[4], params[5]],
      maxTex: [params[6], params[7]],
    };
  }

  initialize(texture: Texture) {
    const topLeft = [-1, -1, 1, 1, 0, 1, 0.2, 0.8];
    const topRight = [-1, 0, 0.5, 1];

    const quads: IQuadModel[] = [this.buildQuad(topLeft)];

    this._buffer.setBuffers(quads);

    this._texture = texture;

    // enable the shader
    this._shader.enable();

    /** Shader info for this shader */
    this._shaderInfo = {
      attr: { aPos: 0, aTex: 0 },
      uniform: { uSampler: 0 },
    };
    // create the shader from the vertex and fragment source
    this._shader = new ShaderController(this.gl, 'simple');
    this._shader.initShaderProgram(vsSource, fsSource);

    // set the info
    this._shaderInfo.attr.aPos = this._shader.getAttribute('aPos');
    this._shaderInfo.attr.aTex = this._shader.getAttribute('aTex');
    this._shaderInfo.uniform.uSampler = this._shader.getUniform('uSampler');
  }

  update(dt: number) {
    // enable the buffer
    this._buffer.enable();

    // enable the shader
    this._shader.enable();

    // Bind the texture to texture unit 0
    this._texture.enable(this._shaderInfo.uniform.uSampler);

    {
      const vertexCount = this._buffer.indexCount;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}
