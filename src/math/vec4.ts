import mat4 from './mat4';

import { epsilon } from './constants';

export default class vec4 {
  x: number;
  y: number;
  z: number;
  w: number;

  get xy(): [number, number] {
    return [this.x, this.y];
  }

  get xyz(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  get xyzw(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }

  constructor(x?: number, y?: number, z?: number, w?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
    this.z = z ?? 0;
    this.w = w ?? 0;
  }

  static readonly zero = new vec4(0, 0, 0, 1);
  static readonly one = new vec4(1, 1, 1, 1);

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 0;
  }

  copy(dest?: vec4): vec4 {
    if (!dest) {
      dest = new vec4();
    }

    dest.x = this.x;
    dest.y = this.y;
    dest.z = this.z;
    dest.w = this.w;

    return dest;
  }

  negate(dest?: vec4): vec4 {
    if (!dest) {
      dest = this;
    }

    dest.x = -this.x;
    dest.y = -this.y;
    dest.z = -this.z;
    dest.w = -this.w;

    return dest;
  }

  equals(vector: vec4, threshold = epsilon): boolean {
    if (Math.abs(this.x - vector.x) > threshold) {
      return false;
    }

    if (Math.abs(this.y - vector.y) > threshold) {
      return false;
    }

    if (Math.abs(this.z - vector.z) > threshold) {
      return false;
    }

    if (Math.abs(this.w - vector.w) > threshold) {
      return false;
    }

    return true;
  }

  length(): number {
    return Math.sqrt(this.squaredLength());
  }

  squaredLength(): number {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const w = this.w;

    return x * x + y * y + z * z + w * w;
  }

  add(vector: vec4): vec4 {
    this.x += vector.x;
    this.y += vector.y;
    this.z += vector.z;
    this.w += vector.w;

    return this;
  }

  subtract(vector: vec4): vec4 {
    this.x -= vector.x;
    this.y -= vector.y;
    this.z -= vector.z;
    this.w -= vector.w;

    return this;
  }

  multiply(vector: vec4): vec4 {
    this.x *= vector.x;
    this.y *= vector.y;
    this.z *= vector.z;
    this.w *= vector.w;

    return this;
  }

  divide(vector: vec4): vec4 {
    this.x /= vector.x;
    this.y /= vector.y;
    this.z /= vector.z;
    this.w /= vector.w;

    return this;
  }

  scale(value: number, dest?: vec4): vec4 {
    if (!dest) {
      dest = this;
    }

    dest.x *= value;
    dest.y *= value;
    dest.z *= value;
    dest.w *= value;

    return dest;
  }

  normalize(dest?: vec4): vec4 {
    if (!dest) {
      dest = this;
    }

    let length = this.length();

    if (length === 1) {
      return this;
    }

    if (length === 0) {
      dest.x *= 0;
      dest.y *= 0;
      dest.z *= 0;
      dest.w *= 0;

      return dest;
    }

    length = 1.0 / length;

    dest.x *= length;
    dest.y *= length;
    dest.z *= length;
    dest.w *= length;

    return dest;
  }

  multiplyMat4(matrix: mat4, dest?: vec4): vec4 {
    if (!dest) {
      dest = this;
    }

    return matrix.multiplyVec4(this, dest);
  }

  static mix(vector: vec4, vector2: vec4, time: number, dest?: vec4): vec4 {
    if (!dest) {
      dest = new vec4();
    }

    dest.x = vector.x + time * (vector2.x - vector.x);
    dest.y = vector.y + time * (vector2.y - vector.y);
    dest.z = vector.z + time * (vector2.z - vector.z);
    dest.w = vector.w + time * (vector2.w - vector.w);

    return dest;
  }

  static sum(vector: vec4, vector2: vec4, dest?: vec4): vec4 {
    if (!dest) {
      dest = new vec4();
    }

    dest.x = vector.x + vector2.x;
    dest.y = vector.y + vector2.y;
    dest.z = vector.z + vector2.z;
    dest.w = vector.w + vector2.w;

    return dest;
  }

  static difference(vector: vec4, vector2: vec4, dest?: vec4): vec4 {
    if (!dest) {
      dest = new vec4();
    }

    dest.x = vector.x - vector2.x;
    dest.y = vector.y - vector2.y;
    dest.z = vector.z - vector2.z;
    dest.w = vector.w - vector2.w;

    return dest;
  }

  static product(vector: vec4, vector2: vec4, dest?: vec4): vec4 {
    if (!dest) {
      dest = new vec4();
    }

    dest.x = vector.x * vector2.x;
    dest.y = vector.y * vector2.y;
    dest.z = vector.z * vector2.z;
    dest.w = vector.w * vector2.w;

    return dest;
  }

  static quotient(vector: vec4, vector2: vec4, dest?: vec4): vec4 {
    if (!dest) {
      dest = new vec4();
    }

    dest.x = vector.x / vector2.x;
    dest.y = vector.y / vector2.y;
    dest.z = vector.z / vector2.z;
    dest.w = vector.w / vector2.w;

    return dest;
  }
  toString() {
    return this.x.toFixed(5) + ', ' + this.y.toFixed(5) + ', ' + this.z.toFixed(5) + ', ' + this.w.toFixed(5);
  }
}
