import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec4 from '../math/vec4';
import { GlBuffer } from './GlBuffer';
import { PlaneGeometry } from './PlaneGeometry';

/**
 * Plane mesh that can be rendered
 */
export class PlaneMesh extends Component {
  private buffer: GlBuffer;

  constructor(eng: Engine) {
    super(eng);
    this.buffer = new GlBuffer(this.eng.gl);
  }

  initialize(): void {
    const geometry = PlaneGeometry.createPlanes([
      {
        width: 1,
        height: 1,
        color: new vec4(1, 0, 0, 1),
        transform: mat4.identity,
        uuid: this.eng.random.getUuid(),
        uvTransform: mat3.identity,
      },
    ]);
    this.buffer.setTextureColorBuffers(geometry);
  }

  draw(): void {
    this.buffer.enable();
    const vertexCount = this.buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
