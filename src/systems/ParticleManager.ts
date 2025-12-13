import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';

export class ParticleManage extends Component {
  private _texture: Texture;
  protected _quad: Quad;
  private _buffer: GlBuffer;
  private _particle: RuntimeTileData;

  private _shader: SpritePerspectiveShader;
  constructor(eng: Engine) {
    super(eng);
  }

  async initialize(): Promise<void> {
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'particleShader');
  }

  async loadLevel(): Promise<void> {
    const tileAtlas = this.eng.assetManager.atlasData['default'];
    const tileData = tileAtlas.tiles['particle white'];
    this._texture = await this.eng.assetManager.getTexture(tileAtlas.texture);

    this._particle = new RuntimeTileData(this.eng, 'particle1', tileData, this._texture);
    this._particle.setTileTransform({ position: new vec3(10, -150, 0.0) });

    if (!this._particle) {
      console.error('Cannot find menu title');
      return;
    }

    this._shader.setSpriteSheet(this._texture);
    const geo = QuadGeometry.createQuad([this._particle.quad]);
    this._buffer.setBuffers(geo);
  }

  update(dt: number): void {
    this._shader.enable();

    const proj = this.eng.viewManager.projection;

    this._shader.setProj(proj);
    this._buffer.enable();

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;

    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
  }
}
