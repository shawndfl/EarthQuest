import { GlBuffer, IQuadModel } from './GlBuffer';
import * as mat4 from '../math/mat4';
import { ShaderController } from './ShaderController';
import { TextManager } from './TextManager';
import { FpsController } from './FpsController';
import { Texture } from './Texture';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';

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

/**
 * Sample scene
 */
export class Scene {
  buffer: GlBuffer;
  shader: ShaderController;
  textManager: TextManager;

  fps: FpsController;
  texture: Texture;

  shaderInfo: {
    attr: { aPos: number; aTex: number };
    uniform: { uSampler: number };
  };
  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(private gl: WebGL2RenderingContext) {
    // test text manager
    this.textManager = new TextManager(this.gl);
    this.textManager.initialize(FontImage, FontData);
    this.textManager.addText({
      id: 'welcomeText',
      text: 'Hello are you doing ok?\n  Only if this works :)',
      position: new vec2([-1, 0]),
      color: new vec4([1, 1, 1, 0]),
      depth: 0.5,
      scale: 1.0,
    });

    this.texture = new Texture(this.gl);
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

    this.texture.initialize(FontImage);
    // Browsers copy pixels from the loaded image in top-to-bottom order —
    // from the top-left corner; but WebGL wants the pixels in bottom-to-top
    // order — starting from the bottom-left corner. So in order to prevent
    // the resulting image texture from having the wrong orientation when
    // rendered, we need to make the following call, to cause the pixels to
    // be flipped into the bottom-to-top order that WebGL expects.
    // See jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down
    //this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    // Create a new buffer
    this.buffer = new GlBuffer(this.gl);

    const quads: IQuadModel[] = [
      {
        max: new vec2([0.5, 0.5]),
        min: new vec2([-0.5, -0.5]),
        depth: 0,
        minTex: new vec2([0, 0]),
        maxTex: new vec2([1, 1]),
        color: new vec4([1, 0, 0, 1]),
      },
    ];
    this.buffer.setBuffers(quads, true);

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
  update(dt: number) {
    this.fps.update(dt);

    this.gl.enable(this.gl.BLEND);
    this.gl.clearColor(0.3, 0.3, 0.6, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // update the texture manager
    this.textManager.update(dt);

    // enable the buffer
    this.buffer.enable();

    // enable the shader
    this.shader.enable();

    // Bind the texture to texture unit 0
    this.texture.enable(this.shaderInfo.uniform.uSampler);

    {
      const vertexCount = this.buffer.indexCount;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      //this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    }
  }

  dispose() {
    console.log('dispose');
  }
}
