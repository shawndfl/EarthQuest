import vec2 from './vec2';

export default class edge2 {
  start: vec2;
  end: vec2;
  normal: vec2;

  length(): number {
    const toEnd = this.start.copy().subtract(this.end);
    return toEnd.length();
  }

  /**
   * Direction of the line normalized
   * @returns
   */
  direction(): vec2 {
    return this.directionFull().normalize();
  }

  /**
   * The vector end - start not normalize
   * @returns
   */
  directionFull(): vec2 {
    return new vec2(this.end.x - this.start.x, this.end.y - this.start.y);
  }

  /**
   * normal are to the left of the edge so that when building edges in a clockwise order
   * you will have the normals facing outward.
   *
   *              ^
   *              | end       | start                   y ^  screen space
   *  normal  <---|           |--->  normal               |
   *              |           |                           |
   *        start |       end |                           |---------> x
   *                          V
   */
  updateNormal(): vec2 {
    const dx = this.end.x - this.start.x;
    const dy = this.end.y - this.start.y;
    this.normal.x = -dy;
    this.normal.y = dx;
    return this.normal.normalize();
  }

  constructor(sx: number, sy: number, ex: number, ey: number) {
    this.start = new vec2(sx, sy);
    this.end = new vec2(ex, ey);
    this.normal = new vec2();
    this.updateNormal();
  }

  doesOverLapAlongMyNormal(other: edge2, includeStartAndEnd?: boolean): boolean {
    let toTheirStart = other.start.copy().subtract(this.start).normalize();
    let toTheirEnd = other.end.copy().subtract(this.start).normalize();
    const dir1 = this.direction();
    const d1 = vec2.dot(dir1, toTheirStart);
    const d2 = vec2.dot(dir1, toTheirEnd);

    if (includeStartAndEnd ? d1 < 0 && d2 < 0 : d1 <= 0 && d2 <= 0) {
      return false;
    }

    toTheirStart = other.start.copy().subtract(this.end).normalize();
    toTheirEnd = other.end.copy().subtract(this.end).normalize();
    const dir2 = this.direction().copy().negate();

    const d3 = vec2.dot(dir2, toTheirStart);
    const d4 = vec2.dot(dir2, toTheirEnd);

    if (includeStartAndEnd ? d3 < 0 && d4 > 0 : d3 <= 0 || d4 <= 0) {
      return true;
    }

    return true;
  }

  /**
   * Find the point a line intersects a line
   * @param start1
   * @param end1
   * @param start2
   * @param end2
   * @returns
   */
  lineIntersection(other: edge2, infinite?: boolean): vec2 {
    const start1 = this.start;
    const start2 = other.start;
    const end1 = this.end;
    const end2 = other.end;

    const denom = (start1.x - end1.x) * (start2.y - end2.y) - (start1.y - end1.y) * (start2.x - end2.x);

    if (denom === 0) {
      // Lines are parallel (or coincident)
      return null;
    }

    const px =
      ((start1.x * end1.y - start1.y * end1.x) * (start2.x - end2.x) -
        (start1.x - end1.x) * (start2.x * end2.y - start2.y * end2.x)) /
      denom;
    const py =
      ((start1.x * end1.y - start1.y * end1.x) * (start2.y - end2.y) -
        (start1.y - end1.y) * (start2.x * end2.y - start2.y * end2.x)) /
      denom;

    const p = new vec2([px, py]);
    const toEnd = start1.copy().subtract(end1);
    const toPoint = start1.copy().subtract(p);
    const limit = toEnd.length();
    const t = toPoint.length();

    // past the end point
    if (!infinite && t > limit) {
      return null;
    }
    // intersecting behind
    if (!infinite && vec2.dot(toEnd, toPoint) < 0) {
      return null;
    }
    return new vec2([px, py]);
  }

  /**
   * Get the distance between a point a line
   * @param x
   * @param y
   * @returns
   */
  distanceToPoint(x: number, y: number): number {
    return edge2.pointToSegment(x, y, this.start.x, this.start.y, this.end.x, this.end.y);
  }

  /**
   * Distance from a point to a segment.
   */
  private static pointToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
    // start to end x
    const abx = bx - ax;
    // start to end y
    const aby = by - ay;
    // start to point x
    const apx = px - ax;
    // start to point y
    const apy = py - ay;
    // segment length
    const abLen2 = abx * abx + aby * aby;

    if (abLen2 === 0) {
      return Math.hypot(px - ax, py - ay);
    }

    let t = (apx * abx + apy * aby) / abLen2;
    t = Math.max(0, Math.min(1, t)); // clamp

    const cx = ax + abx * t;
    const cy = ay + aby * t;

    return Math.hypot(px - cx, py - cy);
  }

  /**
   * Distance between two finite segments.
   * If segments intersect → 0
   */
  DistanceToSegment(other: edge2): number {
    // If they intersect (infinite line intersection), distance is 0.
    if (this.lineIntersection(other, true)) {
      return 0;
    }

    const a = this.start;
    const b = this.end;
    const c = other.start;
    const d = other.end;

    return Math.min(
      // start to other edge
      edge2.pointToSegment(a.x, a.y, c.x, c.y, d.x, d.y),
      // end to other edge
      edge2.pointToSegment(b.x, b.y, c.x, c.y, d.x, d.y),
      // other start to this edge
      edge2.pointToSegment(c.x, c.y, a.x, a.y, b.x, b.y),
      // other end to this edge
      edge2.pointToSegment(d.x, d.y, a.x, a.y, b.x, b.y)
    );
  }
}
