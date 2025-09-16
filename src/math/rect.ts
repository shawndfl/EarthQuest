import { epsilon } from './constants';
import vec2 from './vec2';
import vec3 from './vec3';

export default class rect {
  get left(): number {
    return this.values[0];
  }

  get width(): number {
    return this.values[1];
  }

  get top(): number {
    return this.values[2];
  }

  get height(): number {
    return this.values[3];
  }

  get right(): number {
    return this.left + this.width;
  }

  get bottom(): number {
    return this.top - this.height;
  }

  set left(value: number) {
    this.values[0] = value;
  }

  set width(value: number) {
    this.values[1] = value;
  }

  set top(value: number) {
    this.values[2] = value;
  }

  set height(value: number) {
    this.values[3] = value;
  }

  get centerX(): number {
    return this.left + this.width / 2;
  }

  get centerY(): number {
    return this.top + this.height / 2;
  }

  /**
   *
   * @param values left, width, top, height
   */
  constructor(values?: [number, number, number, number]) {
    if (values !== undefined) {
      this.values[0] = values[0];
      this.values[1] = values[1];
      this.values[2] = values[2];
      this.values[3] = values[3];
    }
  }

  private values = new Float32Array(4);

  at(index: number): number {
    return this.values[index];
  }

  reset(): void {
    this.values[0] = 0;
    this.values[1] = 0;
    this.values[2] = 0;
    this.values[3] = 0;
  }

  copy(dest?: rect): rect {
    if (!dest) {
      dest = new rect();
    }

    dest.left = this.left;
    dest.width = this.width;
    dest.top = this.top;
    dest.height = this.height;

    return dest;
  }

  contains(other: rect): boolean {
    if (other.left < this.left) {
      return false;
    }
    if (other.right > this.right) {
      return false;
    }
    if (other.top > this.top) {
      return false;
    }

    if (other.bottom < this.bottom) {
      return false;
    }

    return true;
  }

  /**
   * Check if a point is inside this rectangle (inclusive).
   */
  containsPoint(point: vec2 | vec3): boolean {
    return point.x >= this.left && point.x <= this.right && point.y <= this.top && point.y >= this.bottom;
  }

  intersects(other: Readonly<rect>): boolean {
    if (this.right < other.left) {
      return false;
    }
    if (this.left > other.right) {
      return false;
    }
    if (this.top < other.bottom) {
      return false;
    }

    if (this.bottom > other.top) {
      return false;
    }

    return true;
  }

  /**
   * Get the intersection point
   * @param start
   * @param end
   * @returns
   */
  intersectionPoint(start: vec2, end: vec2): vec2 {
    const topLeft = new vec2([this.left, this.top]);
    const topRight = new vec2([this.right, this.top]);
    const bottomLeft = new vec2([this.left, this.bottom]);
    const bottomRight = new vec2([this.right, this.bottom]);

    const edges: [vec2, vec2][] = [
      [topLeft, topRight], // Top
      [topRight, bottomRight], // Right
      [bottomRight, bottomLeft], // Bottom
      [bottomLeft, topLeft], // Left
    ];

    // check each edge for an intersection
    for (const [a, b] of edges) {
      const intersection = this.lineIntersection(start, end, a, b);
      if (intersection) {
        return intersection;
      }
    }

    return null;
  }

  /**
   * Find the point a line intersects a line
   * @param start1
   * @param end1
   * @param start2
   * @param end2
   * @returns
   */
  lineIntersection(start1: vec2, end1: vec2, start2: vec2, end2: vec2): vec2 {
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
    if (t > limit) {
      return null;
    }
    // intersecting behind
    if (vec2.dot(toEnd, toPoint) < 0) {
      return null;
    }
    return new vec2([px, py]);
  }

  equals(vector: rect, threshold = epsilon): boolean {
    if (Math.abs(this.left - vector.left) > threshold) {
      return false;
    }

    if (Math.abs(this.width - vector.width) > threshold) {
      return false;
    }

    if (Math.abs(this.top - vector.top) > threshold) {
      return false;
    }

    if (Math.abs(this.height - vector.height) > threshold) {
      return false;
    }

    return true;
  }

  toString() {
    return (
      '[' +
      this.left.toFixed(5) +
      ', ' +
      this.top.toFixed(5) +
      '] (' +
      this.width.toFixed(5) +
      ' X ' +
      this.height.toFixed(5) +
      ')'
    );
  }
}
