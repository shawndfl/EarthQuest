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

  /**
   * See if two edges intersect
   * @param other
   * @returns
   */
  Intersects(other: edge2): vec2 {
    const x1 = this.start.x;
    const y1 = this.start.y;
    const x2 = this.end.x;
    const y2 = this.end.y;
    const x3 = other.start.x;
    const y3 = other.start.y;
    const x4 = other.end.x;
    const y4 = other.end.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    // Lines are parallel or coincident
    if (denom === 0) {
      return null;
    }

    const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;

    const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

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
    if (this.Intersects(other)) {
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
