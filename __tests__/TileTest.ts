import { TileHelper } from '../src/utilities/TileHelper';

test('TileMinDepth', () => {
  const t = new TileHelper();
  t.calculateTransform(800, 600);
  const depth = t.getScreenDepth(0, 0, 0);

  expect(depth).toBe(-1);
});

test('TileMaxDepth', () => {
  const t = new TileHelper();
  t.calculateTransform(800, 600);
  const depth = t.getScreenDepth(100, 100, 5);

  expect(depth).toBe(1);
});

test('TileMidDepth', () => {
  const t = new TileHelper();
  t.calculateTransform(800, 600);
  const depth = t.getScreenDepth(50, 50, 2.5);

  expect(depth).toBe(0);
});
