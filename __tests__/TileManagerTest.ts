import { Engine } from '../src/core/Engine';
import { TileHelper } from '../src/utilities/TileHelper';
import 'jest-webgl-canvas-mock';
const eng = new Engine();

test('To screen', () => {
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

test('Create an Engine', () => {
  const canvas = new HTMLCanvasElement();
  const eng = new Engine();

  eng.initialize(canvas);
  eng.gl.depthFunc(eng.gl.ALWAYS);
});
