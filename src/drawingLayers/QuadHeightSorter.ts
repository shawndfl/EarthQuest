import { Quad } from '../graphics/QuadGeometry';
import vec3 from '../math/vec3';

/**
 * Sorts the quads by height and uses the depth bias as an offset
 */
export class QuadHeightSorter {
  /**
   * sorts in-place by height.
   * @param a
   * @param b
   */
  sort(quads: Quad[]): Quad[] {
    // used to sort bottom point of a quad
    const pointA = new vec3(0, 0, 0);
    const pointB = new vec3(0, 0, 0);
    // sort by height
    quads.sort((a, b) => {
      const bottomA = -a.height / 2 + a.offset.y;
      pointA.x = 0;
      pointA.y = bottomA;
      pointA.z = 0;
      a.transform?.multiplyVec3(pointA, pointA);
      pointA.y += a.depthBias;

      const bottomB = -b.height / 2 + b.offset.y;
      pointB.x = 0;
      pointB.y = bottomB;
      pointB.z = 0;
      b.transform?.multiplyVec3(pointB, pointB);
      pointB.y += b.depthBias;

      return pointB.y - pointA.y;
    });
    return quads;
  }
}
