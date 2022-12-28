import { GlBuffer, QuadModel } from './GlBuffer';
import * as mat4 from '../math/mat4';
import { ShaderController } from './ShaderController';
import { TextManager } from './TextManager';
import { FpsController } from './FpsController';

const vsSource = `
    attribute vec4 aPos;
    attribute vec2 aTex;

    varying highp vec2 vTex;

    void main() {
        vTex = aTex;
        gl_Position = aPos;
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

/**
 * Sample scene
 */
export class Scene {
  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(gl) {
    /** @type {GlBuffer} The gl buffer object that manages the vertex and index buffer */
    this.buffer;

    /** @type {WebGL2RenderingContext} The gl object. All openGL calls go through this */
    this.gl = gl;

    /** @type {ShaderController} Manages the shader for this scene */
    this.shader;

    /** @type {TextManager} TextManager */
    this.textManager = new TextManager();

    /** @type {FpsController} */
    this.fps = new FpsController();

    /** Shader info for this shader */
    this.shaderInfo = {
      attr: { aPos: 0, aTex: 0 },
      uniform: { uSampler: 0 },
    };
  }

  /**
   * Sets up the scene
   */
  init() {
    console.log('init scene');

    // Create font manager
    this.textManager.initialize();

    // Debug matrix
    const m = mat4.create();
    console.debug(m);

    // Create a new buffer
    this.buffer = new GlBuffer(this.gl);

    /** @type {QuadModel} */
    const quads = [
      {
        max: [0.5, 0.5],
        min: [-0.5, -0.5],
        depth: 0,
        minTex: [0, 0],
        maxTex: [1, 1],
        color: [1, 0, 0, 1],
      },
    ];
    this.buffer.initBuffers(quads, true);

    // create the shader from the vertex and fragment source
    this.shader = new ShaderController(this.gl, 'simple');
    this.shader.initShaderProgram(vsSource, fsSource);

    // set the info
    this.shaderInfo.attr.aPos = this.shader.getAttribute('aPos');
    this.shaderInfo.attr.aTex = this.shader.getAttribute('aTex');
    this.shaderInfo.uniform.uSampler = this.shader.getUniform('uSampler');
  }

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt) {
    this.fps.update(dt);
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // update the texture manager
    this.textManager.update(dt);

    // enable the buffer
    this.buffer.enable(this.shaderInfo.attr.aPos, this.shaderInfo.attr.aTex);

    // enable the shader
    this.shader.enable();

    {
      const vertexCount = this.buffer.indexCount;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }

  dispose() {
    console.log('dispose');
  }
}
