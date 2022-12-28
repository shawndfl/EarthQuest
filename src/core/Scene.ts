import { TextManager } from './TextManager';
import { FpsController } from './FpsController';
import { Texture } from './Texture';
import grassImage from '../assets/grass.png';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { Ground } from '../environment/Ground';

/**
 * Sample scene
 */
export class Scene {
  textManager: TextManager;

  fps: FpsController;
  texture: Texture;
  ground: Ground;

  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(private gl: WebGL2RenderingContext) {
    // test text manager
    this.textManager = new TextManager(this.gl);

    this.textManager.initialize(FontImage, FontData);
    this.textManager.setTextBlock({
      id: 'welcomeText',
      text: 'Earth Quest',
      position: new vec2([-800, 600]),
      color: new vec4([1, 0, 0, 0.5]),
      depth: 0,
      scale: 0.5,
    });

    this.fps = new FpsController(this.textManager);

    this.texture = new Texture(this.gl);
    this.ground = new Ground(this.gl);
  }

  /**
   * Sets up the scene
   */
  init() {
    console.log('init scene');

    // Browsers copy pixels from the loaded image in top-to-bottom order —
    // from the top-left corner; but WebGL wants the pixels in bottom-to-top
    // order — starting from the bottom-left corner. So in order to prevent
    // the resulting image texture from having the wrong orientation when
    // rendered, we need to make the following call, to cause the pixels to
    // be flipped into the bottom-to-top order that WebGL expects.
    // See jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.texture.initialize(grassImage);
    this.ground.initialize(this.texture);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
  }

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {
    this.fps.update(dt);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.clearColor(0.1, 0.1, 0.1, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // update the texture manager
    this.textManager.update(dt);

    this.ground.update(dt);
  }

  resize(width: number, height: number) {}

  dispose() {
    console.log('dispose');
  }
}
