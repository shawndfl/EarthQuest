import { GlBuffer } from './GlBuffer';
import * as mat4 from '../math/mat4';
import { ShaderController } from './ShaderController';

const vsSource = `
  attribute vec4 aPos;
  void main() {
    gl_Position = aPos;
  }
`;

// Fragment shader program

const fsSource = `
  void main() {
    gl_FragColor = vec4(0.0, 0.2, .6, 1.0);
  }
`;

/**
 * Sample scene
 */
export class Scene {
  constructor() {
    this.buffer;
    this.gl;
    this.shader;
    this.programInfo = {
      program: null,

      attribLocations: {
        vertexPosition: null,
      },
    };
  }

  /**
   * Sets up the scene
   * @param {*} gl - The gl context from the canvas
   */
  init(gl) {
    console.log('init');
    this.gl = gl;

    const m = mat4.create();
    console.debug(m);
    //console.debug(gl);
    this.buffer = new GlBuffer();
    this.buffer.initBuffers(this.gl);

    this.shader = new ShaderController();
    this.shader.initShaderProgram(this.gl, vsSource, fsSource);
    this.programInfo = {
      program: this.shader.shaderProgram,

      attribLocations: {
        vertexPosition: gl.getAttribLocation(this.shader.shaderProgram, 'aPos'),
      },
      uniformLocations: {},
    };
  }

  update() {
    console.log('updating');
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 3; // pull out 2 values per iteration
      const type = this.gl.FLOAT; // the data in the buffer is 32bit floats
      const normalize = false; // don't normalize
      const stride = 0; // how many bytes to get from one set of values to the next
      // 0 = use type and numComponents above
      const offset = 0; // how many bytes inside the buffer to start from
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer.buffer);
      this.gl.vertexAttribPointer(
        this.programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(
        this.programInfo.attribLocations.vertexPosition
      );
    }

    // Tell WebGL to use our program when drawing
    this.gl.useProgram(this.programInfo.program);

    {
      const offset = 0;
      const vertexCount = 4;
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }

  dispose() {
    console.log('dispose');
  }
}
