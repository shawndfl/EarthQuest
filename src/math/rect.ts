import { epsilon } from './constants';
import edge2 from './edge2';
import vec2 from './vec2';
import vec3 from './vec3';

export default class rect {
  get type(): string {
    return 'rect';
  }

  left: number;
  top: number;
  width: number;
  height: number;

  get right(): number {
    return this.left + this.width;
  }

  get bottom(): number {
    return this.top - this.height;
  }

  get centerX(): number {
    return this.left + this.width / 2;
  }

  get centerY(): number {
    return this.bottom + this.height / 2;
  }

  /**
   *
   * @param values left, width, top, height
   */
  constructor(left?: number, width?: number, top?: number, height?: number) {
    this.left = left || 0;
    this.width = width || 0;
    this.top = top || 0;
    this.height = height || 0;
  }

  reset(): void {
    this.left = 0;
    this.width = 0;
    this.top = 0;
    this.height = 0;
  }

  /**
   * Get edges that make up this rect.
   * The edges will be in a clockwise orientation with
   * their normals facing out.
   * @returns
   */
  getEdges(): edge2[] {
    return [
      new edge2(this.left, this.top, this.right, this.top),
      new edge2(this.right, this.top, this.right, this.bottom),
      new edge2(this.right, this.bottom, this.left, this.bottom),
      new edge2(this.left, this.bottom, this.left, this.top),
    ];
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

  contains(other: Readonly<rect>): boolean {
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
  containsPoint(x: number, y: number): boolean {
    return x >= this.left && x <= this.right && y <= this.top && y >= this.bottom;
  }

  verticalSplitIntersection(other: Readonly<rect>): boolean {
    if (this.intersects(other)) {
      if (this.right > other.right) {
        return true;
      }
      if (this.left < other.left) {
        return true;
      }
    }

    return false;
  }

  splitHorizontalIntersection(other: Readonly<rect>): boolean {
    if (this.intersects(other)) {
      if (this.top > other.top) {
        return true;
      }
      if (this.bottom < other.bottom) {
        return true;
      }
    }
    return false;
  }

  intersects(other: Readonly<rect>): boolean {
    if (this.right <= other.left) {
      return false;
    }
    if (this.left >= other.right) {
      return false;
    }
    if (this.top <= other.bottom) {
      return false;
    }
    if (this.bottom >= other.top) {
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
  lineIntersection(start1: vec2, end1: vec2, start2: vec2, end2: vec2, infinite?: boolean): vec2 {
    const e1 = new edge2(start1.x, start1.y, end1.x, end1.y);
    const e2 = new edge2(start2.x, start2.y, end2.x, end2.y);
    return e1.lineIntersection(e2, infinite);
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
