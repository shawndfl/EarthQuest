import rect from '../src/math/rect';
import vec2 from '../src/math/vec2';

describe('lineIntersection', () => {
  it('finds intersection of crossing lines', () => {
    const r = new rect();
    const a = new vec2([0, 0]);
    const b = new vec2([10, 10]);
    const c = new vec2([0, 10]);
    const d = new vec2([10, 0]);

    const result = r.lineIntersection(a, b, c, d);
    expect(result).toEqual(new vec2([5, 5]));
  });

  it('returns null for parallel lines', () => {
    const r = new rect();
    const a = new vec2([0, 0]);
    const b = new vec2([10, 10]);
    const c = new vec2([0, 1]);
    const d = new vec2([10, 11]);

    const result = r.lineIntersection(a, b, c, d);
    expect(result).toBeNull();
  });

  it('finds intersection when one line is vertical', () => {
    const r = new rect();
    const a = new vec2([5, 0]);
    const b = new vec2([5, 10]);
    const c = new vec2([0, 5]);
    const d = new vec2([10, 5]);

    const result = r.lineIntersection(a, b, c, d);
    expect(result).toEqual(new vec2([5, 5]));
  });

  it('finds intersection when one line is horizontal', () => {
    const r = new rect();
    const a = new vec2([0, 5]);
    const b = new vec2([10, 5]);
    const c = new vec2([5, 0]);
    const d = new vec2([5, 10]);

    const result = r.lineIntersection(a, b, c, d);
    expect(result).toEqual(new vec2([5, 5]));
  });

  it('works with negative coordinates', () => {
    const r = new rect();
    const a = new vec2([-10, -10]);
    const b = new vec2([0, 0]);
    const c = new vec2([-10, 0]);
    const d = new vec2([0, -10]);

    const result = r.lineIntersection(a, b, c, d);
    expect(result).toEqual(new vec2([-5, -5]));
  });
});

describe('rectIntersection', () => {
  it('finds intersection of rect and line', () => {
    const r = new rect([0, 10, 0, 10]);
    const start = new vec2([-1, 1]);
    const end = new vec2([1, 1]);

    const result = r.intersectionPoint(start, end);
    expect(result).toEqual(new vec2([0, 1]));
  });
  it('finds intersection of rect and line backwards', () => {
    const r = new rect([0, 10, 0, 10]);
    const start = new vec2([-1, 1]);
    const end = new vec2([-10, 1]);

    const result = r.intersectionPoint(start, end);
    expect(result).toEqual(null);
  });

  it('finds intersection of rect and line backwards', () => {
    const r = new rect([0, 10, 0, 10]);
    const start = new vec2([-1, 1]);
    const end = new vec2([-10, 1]);

    const result = r.intersectionPoint(start, end);
    expect(result).toEqual(null);
  });
});
