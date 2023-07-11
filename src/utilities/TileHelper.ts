import { Component } from '../components/Component';
import mat4 from '../math/mat4';
import vec3 from '../math/vec3';
import { Engine } from '../core/Engine';
import vec2 from '../math/vec2';

/**
 * This class is used to convert tile and screen coordinates
 */
export class TileHelper {
  protected _toScreen: mat4;
  protected _toTile: mat4;
  readonly depthScale: number;
  private width: number;
  private height: number;

  constructor() {
    this.depthScale = 50;
  }

  public calculateTransform(width: number, height: number) {
    this.width = width;
    this.height = height;

    const scale = 2.0;
    const tileSize = 32;
    const cellSize = tileSize * scale;
    const halfCell = cellSize * 0.5;
    const quarterCell = cellSize * 0.25;

    const xAxis = new vec3([halfCell, -halfCell, 0]);
    const yAxis = new vec3([-quarterCell, -quarterCell, halfCell]);
    const zAxis = new vec3([
      (-quarterCell / (this.height * this.depthScale)) * 2,
      (-quarterCell / (this.height * this.depthScale)) * 2,
      0,
    ]);

    // translation part
    const halfWidth = this.width * 0.5;
    const heightOffset = this.height - quarterCell;
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

  /**
   * Rotates a vector in the xy plane to a ~45 degree isometric plane
   * @param tileVector
   * @returns
   */
  rotateToTileSpace(tileVector: vec3 | vec2): vec3 {
    let world = new vec3(tileVector.x, tileVector.y, (tileVector as any).z ?? 0);

    const right = new vec3(0.5, -0.5, 0);
    const up = new vec3(-0.5, -0.5, 0);

    const x = vec3.dot(world, right.normalize());
    const y = vec3.dot(world, up.normalize());
    return new vec3(x, y, 0);
  }

  rotateFromTileSpace(screenVector: vec3 | vec2): vec3 {
    let world = new vec3(screenVector.x, screenVector.y, (screenVector as any).z ?? 0);

    const d = 1.0 / (-0.25 - 0.25);
    const right = new vec3(d * -0.5, d * 0.5, 0);
    const up = new vec3(d * 0.5, d * 0.5, 0);

    const x = vec3.dot(world, right.normalize());
    const y = vec3.dot(world, up.normalize());
    return new vec3(x, y, 0);
  }

  toTileLoc(screenPixels: vec3, proj?: mat4): vec3 {
    let cell = this._toTile.multiplyVec3(screenPixels);
    return cell;
  }

  getScreenDepth(i: number, j: number, k: number, maxI: number = 100, maxJ: number = 100, maxK: number = 5): number {
    const depth = i + j * maxI + k * maxJ * maxI;
    const scaledDepth = depth / (maxI * maxJ * maxK + maxJ * maxI + maxI);
    const normalizedDepth = scaledDepth * 2 - 1;
    return normalizedDepth;
  }

  toScreenLoc(i: number, j: number, k: number): vec3 {
    const cell = new vec3([i, j, k]);
    const screen = this._toScreen.multiplyVec3(cell);
    return screen;
  }
}
