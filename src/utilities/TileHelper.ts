import { Component } from '../components/Component';
import mat4 from '../math/mat4';
import vec3 from '../math/vec3';
import { Engine } from '../core/Engine';

/**
 * This class is used to convert tile and screen coordinates
 */
export class TileHelper extends Component {
  protected _toScreen: mat4;
  protected _toTile: mat4;
  depthScale: number;

  constructor(eng: Engine) {
    super(eng);
    this.depthScale = 50;
    this.calculateTransform();
  }

  private calculateTransform() {
    const screenWidth = this.eng.width;
    const screenHeight = this.eng.height;

    const scale = 2.0;
    const tileSize = 32;
    const cellSize = tileSize * scale;
    const halfCell = cellSize * 0.5;
    const quarterCell = cellSize * 0.25;

    const xAxis = new vec3([halfCell, -halfCell, 0]);
    const yAxis = new vec3([-quarterCell, -quarterCell, halfCell]);
    const zAxis = new vec3([
      (-quarterCell / (screenHeight * this.depthScale)) * 2,
      (-quarterCell / (screenHeight * this.depthScale)) * 2,
      0,
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

    const right = new vec3(0.5, -0.5, 0);
    const up = new vec3(-0.5, -0.5, 0);

    const x = vec3.dot(screenVector, right.normalize());
    const y = vec3.dot(screenVector, up.normalize());

    return new vec3(x, y, 0);
  }

  toTileLoc(x: number, y: number, z: number): { i: number; j: number; k: number } {
    const screen = new vec3([x, y, z]);
    let cell = this._toTile.multiplyVec3(screen);
    return { i: cell.x, j: cell.y, k: cell.z };
  }

  toScreenLoc(i: number, j: number, k: number): vec3 {
    this.eng.viewManager.screenX;
    const cell = new vec3([i, j, k]);

    const screen = this._toScreen.multiplyVec3(cell);

    return screen;
  }
}
