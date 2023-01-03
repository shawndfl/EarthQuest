import { QuadTree } from '../src/environment/QuadTree';
import mat4 from '../src/math/mat4';
import vec3 from '../src/math/vec3';

test('quadTree', () => {
  const tree = new QuadTree();

  const scale = 2.0;
  const screenWidth = 800;
  const screenHeight = 600;

  //tree.addQuad(0, 0);
  // the width and the height are hard coded because the grid is
  // 32 x 32
  const cellSize = 32 * scale;
  const halfWidth = screenWidth * 0.5;
  const heightOffset = screenHeight - cellSize * 0.25;

  const xAxis = new vec3([cellSize * 0.5, -cellSize * 0.5, 0]);
  const yAxis = new vec3([-cellSize * 0.25, -cellSize * 0.25, cellSize * 0.5]);
  const zAxis = new vec3([0, 0, 1]);
  const trans = new vec3([halfWidth, heightOffset, 0]);
  const matTransform = new mat4([
    xAxis.x,
    yAxis.x,
    zAxis.x,
    0,
    xAxis.y,
    yAxis.y,
    zAxis.y,
    0,
    xAxis.z,
    yAxis.z,
    zAxis.z,
    0,
    trans.x,
    trans.y,
    trans.z,
    1.0,
  ]);

  const cell = new vec3([0, 2, 0]);
  const inv = matTransform.copy();
  inv.inverse();
  const point = matTransform.multiplyVec3(cell);
  expect(point.x).toBeCloseTo(336, 2);
  expect(point.y).toBeCloseTo(552, 2);
  expect(point.z).toBeCloseTo(0, 2);

  const newCell = inv.multiplyVec3(point);
  expect(newCell.x).toBeCloseTo(0, 2);
  expect(newCell.y).toBeCloseTo(2, 2);
  expect(newCell.z).toBeCloseTo(0, 2);
});
