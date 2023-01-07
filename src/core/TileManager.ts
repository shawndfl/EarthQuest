import { Component } from '../components/Component';
import mat4 from '../math/mat4';
import vec3 from '../math/vec3';
import { Engine } from './Engine';

/**
 * This class is used to convert tile and screen coordinates
 */
export class TileManager extends Component {
  protected _toScreen: mat4;
  protected _toTile: mat4;

  constructor(eng: Engine) {
    super(eng);
    this.calculateTransform();
  }

  private calculateTransform() {
    const screenWidth = this.eng.width;
    const screenHeight = this.eng.height;

    /*
    // the width and the height are hard coded because the grid is
          // 32 x 32
          const cellSize = 32 * scale;
          const halfWidth = this.eng.width * 0.5;
          const heightOffset = this.eng.height - cellSize * 0.25;

          const x = -j * cellSize * 0.5 + i * cellSize * 0.5 + halfWidth;
          const y =
            -j * cellSize * 0.25 -
            i * cellSize * 0.25 +
            k * cellSize * 0.5 +
            heightOffset;

          // calculate the top and bottom depth values of the quad.
          // event though the cells are drawn as diamonds they are really quads
          // for depth calculations the top and bottom verts of the quad need to
          // be calculated
          const yRemoveHeight = y - k * cellSize;
          const zLower = (yRemoveHeight / this.eng.height) * 2 - 1;
          const zUpper = (yRemoveHeight / this.eng.height) * 2 - 1;
    */

    const scale = 2.0;
    const tileSize = 32;
    const cellSize = tileSize * scale;
    const halfCell = cellSize * 0.5;
    const quarterCell = cellSize * 0.25;

    const xAxis = new vec3([halfCell, -halfCell, 0]);
    const yAxis = new vec3([-quarterCell, -quarterCell, halfCell]);
    const zAxis = new vec3([
      (-quarterCell / screenHeight) * 2,
      (-quarterCell / screenHeight) * 2,
      ((halfCell - cellSize) / screenHeight) * 2,
    ]);

    // translation part
    const halfWidth = screenWidth * 0.5;
    const heightOffset = screenHeight - quarterCell;
    const trans = new vec3([halfWidth, heightOffset, 1]);

    // create matrix
    this._toScreen = new mat4([
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

    this._toTile = this._toScreen.copy();
    this._toTile.inverse();
  }

  screenVectorToTileSpace(screenVector: vec3): vec3 {
    const xAxis = this._toTile.col(0);
    const yAxis = this._toTile.col(1);

    const right = new vec3(xAxis[0], xAxis[1], xAxis[2]);
    const up = new vec3(yAxis[0], yAxis[1], yAxis[2]);

    const x = vec3.dot(screenVector, right);
    const y = vec3.dot(screenVector, up);

    return new vec3(x, y, 0);
  }

  toTileLoc(
    x: number,
    y: number,
    z: number
  ): { i: number; j: number; k: number } {
    const screen = new vec3([x, y, z]);
    let cell = this._toTile.multiplyVec3(screen);
    return { i: cell.x, j: cell.y, k: cell.z };
  }

  toScreenLoc(
    i: number,
    j: number,
    k: number
  ): { x: number; y: number; z: number } {
    const screen = new vec3([i, j, k]);

    return this._toScreen.multiplyVec3(screen);
  }
}
