import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { Geometry } from './GlBuffer';

export interface FontQuad {
  min: vec3;
  max: vec3;
  minTex: vec2;
  maxTex: vec2;
}

export class TextGeometry {
  /**
   * Creates a quad center at the origin with the given width and height on the x,y plane.
   * This function will sort the quads by bottom y position.
   * @param quads
   * @returns
   */
  static createQuad(quads: FontQuad[]): Geometry {
    const fontLength = quads.length;

    const verts = new Float32Array(fontLength * 4 * 5);
    const indices = new Uint16Array(fontLength * 6);

    //               Building a quad
    //
    //    Pos[-1, 1]                Texture [0,1]
    //   p0---------p1 (max)      p0 ---------p1 (max)
    //   |        / |              |        / |
    //   |      /   |              |      /   |
    //   |    /     |              |    /     |
    //   |  /       |              |  /       |
    //   p3---------p2             p3---------p2
    //  (min)                      (min)
    //
    let vertCount = 0;
    let vertIndex = 0;
    let indexIndex = 0;
    for (let i = 0; i < fontLength; i++) {
      const quad = quads[i];
      verts[vertIndex++] = quad.min.x;
      verts[vertIndex++] = quad.min.y;
      verts[vertIndex++] = quad.min.z;
      verts[vertIndex++] = quad.minTex.x;
      verts[vertIndex++] = quad.maxTex.y;

      verts[vertIndex++] = quad.max.x;
      verts[vertIndex++] = quad.min.y;
      verts[vertIndex++] = quad.min.z;
      verts[vertIndex++] = quad.maxTex.x;
      verts[vertIndex++] = quad.maxTex.y;

      verts[vertIndex++] = quad.max.x;
      verts[vertIndex++] = quad.max.y;
      verts[vertIndex++] = quad.max.z;
      verts[vertIndex++] = quad.maxTex.x;
      verts[vertIndex++] = quad.minTex.y;

      verts[vertIndex++] = quad.min.x;
      verts[vertIndex++] = quad.max.y;
      verts[vertIndex++] = quad.max.z;
      verts[vertIndex++] = quad.minTex.x;
      verts[vertIndex++] = quad.minTex.y;

      indices[indexIndex++] = vertCount + 0;
      indices[indexIndex++] = vertCount + 1;
      indices[indexIndex++] = vertCount + 3;

      indices[indexIndex++] = vertCount + 1;
      indices[indexIndex++] = vertCount + 2;
      indices[indexIndex++] = vertCount + 3;

      vertCount += 4;
    }

    return {
      verts,
      indices,
    };
  }
}
