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
    const scale = 2.0;
    const tileSize = 32;

    const screenWidth = this.eng.width;
    const screenHeight = this.eng.height;

    //tree.addQuad(0, 0);
    // the width and the height are hard coded because the grid is
    // 32 x 32
    const cellSize = tileSize * scale;
    const halfWidth = screenWidth * 0.5;
    const heightOffset = screenHeight - cellSize * 0.25;

    const xAxis = new vec3([cellSize * 0.5, -cellSize * 0.5, 0]);
    const yAxis = new vec3([
      -cellSize * 0.25,
      -cellSize * 0.25,
      cellSize * 0.5,
    ]);
    const zAxis = new vec3([0, 0, 1]);
    const trans = new vec3([halfWidth, heightOffset, 0]);
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

  toTileLoc(
    x: number,
    y: number,
    z: number
  ): { x: number; y: number; z: number } {
    const screen = new vec3([x, y, z]);
    let cell = this._toTile.multiplyVec3(screen);
    cell.x = Math.round(cell.x);
    cell.y = Math.round(cell.y);
    cell.z = Math.round(cell.z);
    return cell;
  }

  toScreenLoc(
    tileX: number,
    tileY: number,
    tileZ: number
  ): { x: number; y: number; z: number } {
    const screen = new vec3([tileX, tileY, tileZ]);

    return this._toScreen.multiplyVec3(screen);
  }
}
