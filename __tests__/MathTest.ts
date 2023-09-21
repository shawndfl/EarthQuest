import vec2 from '../src/math/vec2';


class Converter {
  static toTileLoc(x: number, y: number): [i: number, j: number] {
    const cellSize = 16;

    const i = -x / cellSize;
    const j = -x / cellSize + .5 * y / cellSize;
    return [i, j];
  }

  static toScreenLoc(i: number, j: number, k: number): [x: number, y: number] {
    const cellSize = 16;
    let x = -i * cellSize + j * cellSize;
    let y = -i * cellSize * .5 - j * cellSize * .5 + k * cellSize;

    return [x, y];
  }
}
test('screenToTile', () => {
  const screen = new vec2(0, 0);
  const screenSize = new vec2(800, 600);

  for (let k = 0; k < 1; k++) {

    for (let j = 0; j < 4; j++) {

      for (let i = 0; i < 3; i++) {
        const [x, y] = Converter.toScreenLoc(i, j, k);
        const [ti, tj] = Converter.toTileLoc(x, y);
        console.debug(i + ', ' + j + ', ' + k + ' = ' + x + ', ' + y + ': ' + Math.floor(ti) + ', ' + Math.floor(tj));
        expect(Math.floor(ti * 1)).toBeCloseTo(i);
        expect(Math.floor(tj * 1)).toBeCloseTo(j);


      }
    }
  }
});
