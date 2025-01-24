import { MockEngine } from '../src/testSupport/MockEngine';
import { TileHelper } from '../src/utilities/TileHelper';

test('To screen', () => {
  const eng = new MockEngine();

  const t = new TileHelper();
  t.calculateTransform(eng.width, eng.height);

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      for (let k = 0; k < 5; k++) {
        const newCell = t.toScreenLoc(i, j, k);
        const tiles = t.toTileLoc(newCell);
        expect.closeTo(tiles.x - i, 0.0001);
        expect.closeTo(tiles.y - j, 0.0001);
        expect.closeTo(tiles.z - k, 0.0001);
      }
    }
  }
});
