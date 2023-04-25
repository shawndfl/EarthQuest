import { epsilon } from './constants';

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
    return this.top + this.height;
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
