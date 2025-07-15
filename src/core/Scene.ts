import { Texture } from '../graphics/Texture';
import { Component } from '../core/Component';
import { ILevelData } from '../data/ILevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { QuadGeometry } from '../graphics/QuadGeometry';
import mat4 from '../math/mat4';
import mat3 from '../math/mat3';
import vec3 from '../math/vec3';
import vec2 from '../math/vec2';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class Scene extends Component {
  private _spriteSheetTexture: Texture;
  private _buffer: GlBuffer;
  private _shader: SpritePerspectiveShader;

  get spriteSheetTexture(): Texture {
    return this._spriteSheetTexture;
  }

  get type(): string {
    return typeof this;
  }

  async initialize(): Promise<void> {
    this._spriteSheetTexture = new Texture(this.gl);
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'scene');

    // get the texture
    await this.spriteSheetTexture.loadImage('./assets/tiles/OnettMap.png');

    // setup the shader
    this._shader.setSpriteSheet(this.spriteSheetTexture);

    const transform = new mat4();
    transform.setIdentity();
    transform.translate(new vec3(400, 300, 0));
    transform.scale(new vec3(5, 5, 5));
    transform.rotate(Math.PI / 2, vec3.forward);

    const uvTransform = new mat3();
    uvTransform.setIdentity();
    uvTransform.scale(new vec2(0.5, 0.5));

    // create a quad
    const geo = QuadGeometry.CreateQuad([{ width: 800, height: 600, transform, uvTransform }]);

    // set the openGL buffers
    this._buffer.setBuffers(geo);
  }

  async loadLevel(level: ILevelData): Promise<void> {}

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {
    // Clear the canvas before we start drawing on it.
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this._shader.enable();
    const scale = 1;
    const adjustX = this.eng.width - this.eng.width * scale;
    const adjustY = this.eng.height - this.eng.height * scale;

    const proj = mat4.orthographic(adjustX, this.eng.width * scale, adjustY, this.eng.height * scale, 0, 1);

    this._shader.setProj(proj);
    this._buffer.enable();

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
  }
}
