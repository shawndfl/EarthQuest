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
import vec4 from '../math/vec4';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class Scene extends Component {
  private _spriteSheetTexture: Texture;
  private _buffer: GlBuffer;
  protected _shader: SpritePerspectiveShader;
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
    //this.createRandomFlowers();
    //this.createGrass();
    //this.createNull();
  }

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

  createRandomFlowers(): void {
    const replacements = ['00', '09', '0A', '0B', '0C'];
    const replacementProbability = 0.01; // 1% chance to replace each "00"

    // Function to process each string
    const map = [];
    for (let i = 0; i < 288; i++) {
      let row = '';
      for (let j = 0; j < 288; j++) {
        if (Math.random() < replacementProbability) {
          row += replacements[Math.floor(Math.random() * replacements.length)];
        } else {
          row += '00';
        }
      }
      map.push(row);
    }

    console.log(map);
  }

  createNull(): void {
    // Function to process each string
    const map = [];
    for (let i = 0; i < 288; i++) {
      let row = '';
      for (let j = 0; j < 288; j++) {
        row += '_0';
      }
      map.push(row);
    }

    console.log(map);
  }

  createGrass(): void {
    // Function to process each string
    const map = [];
    for (let i = 0; i < 288; i++) {
      let row = '';
      for (let j = 0; j < 288; j++) {
        row += '04';
      }
      map.push(row);
    }

    console.log(map);
  }
}
