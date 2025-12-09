import edge2 from '../src/math/edge2';
import vec2 from '../src/math/vec2';

// Reference implementation (pure math, no dependencies)
function intersectRef(a: any, b: any, c: any, d: any) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const [x3, y3] = c;
  const [x4, y4] = d;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (denom === 0) return null;

  const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;

  const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

  return [px, py];
}

describe('edge2', () => {
  test('constructs start and end correctly', () => {
    const e = new edge2(0, 1, 2, 3);
    expect(e.start.x).toBe(0);
    expect(e.start.y).toBe(1);
    expect(e.end.x).toBe(2);
    expect(e.end.y).toBe(3);
  });

  test('computes correct length', () => {
    const e = new edge2(0, 0, 3, 4);
    expect(e.length()).toBeCloseTo(5); // 3-4-5 triangle
  });

  test('detects intersection at correct point', () => {
    // Line 1: (0,0) -> (10,10)
    const e1 = new edge2(0, 0, 10, 10);

    // Line 2: (0,10) -> (10,0)
    const e2 = new edge2(0, 10, 10, 0);

    const result = e1.lineIntersection(e2, true);

    expect(result).not.toBeNull();
    expect(result.x).toBeCloseTo(5);
    expect(result.y).toBeCloseTo(5);
  });

  test('returns null for parallel lines', () => {
    // Parallel horizontal lines
    const e1 = new edge2(0, 0, 10, 0);
    const e2 = new edge2(0, 5, 10, 5);

    const result = e1.lineIntersection(e2, true);

    expect(result).toBeNull();
  });

  test('returns a vec2 instance on intersection', () => {
    const e1 = new edge2(0, 0, 10, 10);
    const e2 = new edge2(0, 10, 10, 0);

    const result = e1.lineIntersection(e2, true);

    expect(result).toBeInstanceOf(vec2);
  });

  const NUM_TESTS = 100; // Adjust to 5,000+ if you want fuzz testing

  function randCoord() {
    return (Math.random() - 0.5) * 100; // range -500..500
  }

  function randomLine() {
    return [
      [randCoord(), randCoord()],
      [randCoord(), randCoord()],
    ];
  }

  for (let i = 0; i < NUM_TESTS; i++) {
    test(`random intersection test #${i + 1}`, () => {
      const [a, b] = randomLine();
      const [c, d] = randomLine();

      const e1 = new edge2(a[0], a[1], b[0], b[1]);
      const e2 = new edge2(c[0], c[1], d[0], d[1]);

      const ref = intersectRef(a, b, c, d);
      const out = e1.lineIntersection(e2, true);

      if (ref === null) {
        expect(out).toBeNull();
      } else {
        expect(out).not.toBeNull();
        expect(out.x).toBeCloseTo(ref[0], 0);
        expect(out.y).toBeCloseTo(ref[1], 0);
      }
    });
  }
});
