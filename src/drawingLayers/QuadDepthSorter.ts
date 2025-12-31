import { Quad } from '../graphics/QuadGeometry';
import vec3 from '../math/vec3';

/**
 * Sorts quads by depth
 */
export class QuadDepthSorter {
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
      pointA.x = 0;
      pointA.y = 0;
      pointA.z = 0;
      a.transform?.multiplyVec3(pointA, pointA);

      pointB.x = 0;
      pointB.y = 0;
      pointB.z = 0;
      b.transform?.multiplyVec3(pointB, pointB);

      return pointB.z - pointA.z;
    });
    return quads;
  }
}
