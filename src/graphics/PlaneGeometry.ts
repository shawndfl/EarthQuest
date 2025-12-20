import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { Geometry } from './GlBuffer';

export interface Plane {
  uuid: string;
  width: number;
  height: number;
  color: vec4;
  transform: mat4;
  uvTransform: mat3;
  mirrorX?: boolean;
  mirrorY?: boolean;
  /**
   * default is center. This can be used to
   * offset the location of the vertices by adding
   * this value to each of the vertices. The value of
   * each vertices goes from
   *     x = [-width/2, width/2]
   *     y = [-height/2, height/2]
   *  To center on the bottom right you would use (width/2, height/2)
   */
  offset?: vec2;
}

export class PlaneGeometry {
  /**
   * Creates a quad center at the origin with the given width and height on the x,y plane.
   * This function will sort the quads by bottom y position.
   * @param quads
   * @returns - vertex structure pos3, texture2, color3
   */
  static createPlanes(planes: Plane[]): Geometry {
    let vertCount = 0;
    let vertIndex = 0;
    let indexIndex = 0;

    // pos3, tex2, color4 and two triangles per plane
    const verts = new Float32Array(planes.length * 3 * 2 * 4 * 2);
    const indices = new Uint16Array(planes.length * 6);

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

    const p0 = new vec3();
    const p1 = new vec3();
    const p2 = new vec3();
    const p3 = new vec3();

    const t0 = new vec2();
    const t1 = new vec2();
    const t2 = new vec2();
    const t3 = new vec2();
    const offset = new vec3();

    for (let plane of planes) {
      plane.offset?.x ?? 0;
      plane.offset?.y ?? 0;

      p0.x = -plane.width / 2 + offset.x;
      p0.y = plane.height / 2 + offset.y;
      p0.z = 0;
      t0.x = plane.mirrorX ? 1 : 0;
      t0.y = plane.mirrorY ? 0 : 1;
      plane.transform?.multiplyVec3(p0, p0);
      plane.uvTransform?.multiplyVec2(t0, t0);

      p1.x = plane.width / 2 + offset.x;
      p1.y = plane.height / 2 + offset.y;
      p1.z = 0;
      t1.x = plane.mirrorX ? 0 : 1;
      t1.y = plane.mirrorY ? 0 : 1;
      plane.transform?.multiplyVec3(p1, p1);
      plane.uvTransform?.multiplyVec2(t1, t1);

      p2.x = plane.width / 2 + offset.x;
      p2.y = -plane.height / 2 + offset.y;
      p2.z = 0;
      t2.x = plane.mirrorX ? 0 : 1;
      t2.y = plane.mirrorY ? 1 : 0;
      plane.transform?.multiplyVec3(p2, p2);
      plane.uvTransform?.multiplyVec2(t2, t2);

      p3.x = -plane.width / 2 + offset.x;
      p3.y = -plane.height / 2 + offset.y;
      p3.z = 0;
      t3.x = plane.mirrorX ? 1 : 0;
      t3.y = plane.mirrorY ? 1 : 0;
      plane.transform?.multiplyVec3(p3, p3);
      plane.uvTransform?.multiplyVec2(t3, t3);

      verts[vertIndex++] = p0.x;
      verts[vertIndex++] = p0.y;
      verts[vertIndex++] = p0.z;
      verts[vertIndex++] = t0.x;
      verts[vertIndex++] = t0.y;
      verts[vertIndex++] = plane.color.x;
      verts[vertIndex++] = plane.color.y;
      verts[vertIndex++] = plane.color.z;
      verts[vertIndex++] = plane.color.w;

      verts[vertIndex++] = p1.x;
      verts[vertIndex++] = p1.y;
      verts[vertIndex++] = p1.z;
      verts[vertIndex++] = t1.x;
      verts[vertIndex++] = t1.y;
      verts[vertIndex++] = plane.color.x;
      verts[vertIndex++] = plane.color.y;
      verts[vertIndex++] = plane.color.z;
      verts[vertIndex++] = plane.color.w;

      verts[vertIndex++] = p2.x;
      verts[vertIndex++] = p2.y;
      verts[vertIndex++] = p2.z;
      verts[vertIndex++] = t2.x;
      verts[vertIndex++] = t2.y;
      verts[vertIndex++] = plane.color.x;
      verts[vertIndex++] = plane.color.y;
      verts[vertIndex++] = plane.color.z;
      verts[vertIndex++] = plane.color.w;

      verts[vertIndex++] = p3.x;
      verts[vertIndex++] = p3.y;
      verts[vertIndex++] = p3.z;
      verts[vertIndex++] = t3.x;
      verts[vertIndex++] = t3.y;
      verts[vertIndex++] = plane.color.x;
      verts[vertIndex++] = plane.color.y;
      verts[vertIndex++] = plane.color.z;
      verts[vertIndex++] = plane.color.w;

      indices[indexIndex++] = vertCount + 0;
      indices[indexIndex++] = vertCount + 3;
      indices[indexIndex++] = vertCount + 1;

      indices[indexIndex++] = vertCount + 1;
      indices[indexIndex++] = vertCount + 3;
      indices[indexIndex++] = vertCount + 2;

      vertCount += 4;
    }

    return {
      verts,
      indices,
    };
  }
}
