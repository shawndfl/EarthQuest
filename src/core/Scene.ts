import { Texture } from '../graphics/Texture';
import { Component } from '../core/Component';
import { ILevelData } from '../data/ILevelData';
import { Geometry, GlBuffer } from '../graphics/GlBuffer';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import mat4 from '../math/mat4';
import mat3 from '../math/mat3';
import vec3 from '../math/vec3';
import vec2 from '../math/vec2';
import { Timer } from '../utilities/Timer';
import { Curve, CurveType } from '../math/Curve';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class Scene extends Component {
  private _spriteSheetTexture: Texture;
  private _buffer: GlBuffer;
  private _shader: SpritePerspectiveShader;
  private hueTimer: Timer;
  private hueValue: number;
  private curve: Curve;

  get spriteSheetTexture(): Texture {
    return this._spriteSheetTexture;
  }

  get type(): string {
    return typeof this;
  }

  async initialize(): Promise<void> {
    this.hueTimer = new Timer();
    this.hueTimer.start();
    this.hueValue = 0;

    this._spriteSheetTexture = new Texture(this.gl);
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'scene');

    // get the texture
    await this.spriteSheetTexture.loadImage('./assets/tiles/OnettMap.png');

    this.curve = new Curve();
    this.curve.pingPong(true);
    this.curve.repeat(-1);
    this.curve.points([
      { p: 0, t: 0 },
      { p: 40, t: 1000 },
    ]);
    this.curve.curve(CurveType.linear);
    this.curve.start();
    this.curve.onUpdate = (value) => {
      const quad1 = this.placeQuad(40, value, 0, 16, 0, 0, 1.0);
      const quad2 = this.placeQuad(45, 30, 0, 1824, 368, 90, 1);

      // set the openGL buffers
      const geo = QuadGeometry.CreateQuad([quad1, quad2]);
      this._buffer.setBuffers(geo);
    };

    // setup the shader
    this._shader.setSpriteSheet(this.spriteSheetTexture);
  }

  placeQuad(posX: number, posY: number, posZ: number, u: number, v: number, hue: number, alpha: number): Quad {
    const transform = new mat4();
    transform.setIdentity();
    transform.translate(new vec3(posX, posY, posZ));
    transform.scale(new vec3(1, 1, 1));

    const uvTransform = new mat3();
    const scaleX = 8 / this.spriteSheetTexture.width;
    const scaleY = 8 / this.spriteSheetTexture.height;
    const offsetX = u / this.spriteSheetTexture.width;
    const offsetY = v / this.spriteSheetTexture.height;
    uvTransform.setIdentity();
    uvTransform.scale(new vec2(scaleX, scaleY));
    uvTransform.setTranslation(new vec2(offsetX, 1 - scaleY - offsetY));

    // create a quad
    return { width: 16, height: 16, transform, uvTransform, mirrorX: false, mirrorY: false, alpha, hueAngle: hue };
  }

  async loadLevel(level: ILevelData): Promise<void> {}

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {
    /*
    // Clear the canvas before we start drawing on it.
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this._shader.enable();
    const scale = 1;
    const adjustX = this.eng.width - this.eng.width * scale;
    const adjustY = this.eng.height - this.eng.height * scale;

    const proj = mat4.orthographic(adjustX, this.eng.width * scale, adjustY, this.eng.height * scale, 0, 1);

    this._shader.setProj(proj);
    this._buffer.enable();

    // update the curve to test depth sort by height
    this.curve.update(dt);

    if (this.hueTimer.elapsed > 50) {
      this.hueTimer.start();
      this.hueValue += 0.1;

      //this._shader.setHue(this.hueValue);
      if (this.hueValue > 360) {
        this.hueValue -= 360;
      }
    }

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;

    this.gl.depthFunc(this.gl.ALWAYS);
    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
    this.gl.depthFunc(this.gl.LEQUAL);
    */
  }
}
