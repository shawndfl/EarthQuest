import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';

export class QuadGeometry {
  /**
   * Creates a quad center at the origin with the given width and height on the x,y plane.
   * @param quads
   * @returns
   */
  static CreateQuad(
    quads: { width: number; height: number; transform: mat4; uvTransform: mat3; mirrorX?: boolean; mirrorY?: boolean }[]
  ): {
    verts: Float32Array;
    indices: Uint16Array;
  } {
    const verts: Float32Array = new Float32Array(quads.length * 5 * 4);
    const indices: Uint16Array = new Uint16Array(quads.length * 6);

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
    const p0 = new vec3();
    const p1 = new vec3();
    const p2 = new vec3();
    const p3 = new vec3();

    const t0 = new vec2();
    const t1 = new vec2();
    const t2 = new vec2();
    const t3 = new vec2();
    for (let quad of quads) {
      p0.x = -quad.width / 2;
      p0.y = quad.height / 2;
      p0.z = 0;
      t0.x = quad.mirrorX ? 1 : 0;
      t0.y = quad.mirrorY ? 0 : 1;
      quad.transform?.multiplyVec3(p0, p0);
      quad.uvTransform?.multiplyVec2(t0, t0);

      p1.x = quad.width / 2;
      p1.y = quad.height / 2;
      p1.z = 0;
      t1.x = quad.mirrorX ? 0 : 1;
      t1.y = quad.mirrorY ? 0 : 1;
      quad.transform?.multiplyVec3(p1, p1);
      quad.uvTransform?.multiplyVec2(t1, t1);

      p2.x = quad.width / 2;
      p2.y = -quad.height / 2;
      p2.z = 0;
      t2.x = quad.mirrorX ? 0 : 1;
      t2.y = quad.mirrorY ? 1 : 0;
      quad.transform?.multiplyVec3(p2, p2);
      quad.uvTransform?.multiplyVec2(t2, t2);

      p3.x = -quad.width / 2;
      p3.y = -quad.height / 2;
      p3.z = 0;
      t3.x = quad.mirrorX ? 1 : 0;
      t3.y = quad.mirrorY ? 1 : 0;
      quad.transform?.multiplyVec3(p3, p3);
      quad.uvTransform?.multiplyVec2(t3, t3);

      verts[vertIndex++] = p0.x;
      verts[vertIndex++] = p0.y;
      verts[vertIndex++] = p0.z;
      verts[vertIndex++] = t0.x;
      verts[vertIndex++] = t0.y;

      verts[vertIndex++] = p1.x;
      verts[vertIndex++] = p1.y;
      verts[vertIndex++] = p1.z;
      verts[vertIndex++] = t1.x;
      verts[vertIndex++] = t1.y;

      verts[vertIndex++] = p2.x;
      verts[vertIndex++] = p2.y;
      verts[vertIndex++] = p2.z;
      verts[vertIndex++] = t2.x;
      verts[vertIndex++] = t2.y;

      verts[vertIndex++] = p3.x;
      verts[vertIndex++] = p3.y;
      verts[vertIndex++] = p3.z;
      verts[vertIndex++] = t3.x;
      verts[vertIndex++] = t3.y;

      indices[indexIndex++] = vertCount + 0;
      indices[indexIndex++] = vertCount + 1;
      indices[indexIndex++] = vertCount + 3;

      indices[indexIndex++] = vertCount + 1;
      indices[indexIndex++] = vertCount + 2;
      indices[indexIndex++] = vertCount + 3;

      vertCount += 4;
    }

    const geo = { verts, indices };
    return geo;
  }
}
