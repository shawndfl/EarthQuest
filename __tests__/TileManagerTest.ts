import { TileManager } from '../src/systems/TileManager';

class MockEngine {
  constructor() {}
  get height(): number {
    return 600;
  }
  get width(): number {
    return 800;
  }
}

test('TileToScreen', () => {
  const eng = new MockEngine();

  const t = new TileManager(eng as any);

  const point = t.toScreenLoc(0, 0, 0);
  expect(point.x).toBeCloseTo(400, 2);
  expect(point.y).toBeCloseTo(584, 2);
  expect(point.z).toBeCloseTo(1, 2);

  const newCell = t.toTileLoc(point.x, point.y, point.z);
  expect(newCell.i).toBeCloseTo(0, 2);
  expect(newCell.j).toBeCloseTo(0, 2);
  expect(newCell.k).toBeCloseTo(0, 2);
});

test('TileToScreenHeight', () => {
  const eng = new MockEngine();

  const t = new TileManager(eng as any);

  const point = t.toScreenLoc(0, 2, 1);
  console.debug('point ' + point.x + ', ' + point.y + ', ' + point.z);
  //expect(point.x).toBeCloseTo(336, 2);
  //expect(point.y).toBeCloseTo(552, 2);
  //expect(point.z).toBeCloseTo(0, 2);

  const newCell = t.toTileLoc(point.x, point.y, point.z);
  console.debug('point ' + point.x + ', ' + point.y + ', ' + point.z);
  //expect(newCell.x).toBeCloseTo(0, 2);
  //expect(newCell.y).toBeCloseTo(2, 2);
  //expect(newCell.z).toBeCloseTo(0, 2);
});
