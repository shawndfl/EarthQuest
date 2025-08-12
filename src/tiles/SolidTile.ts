import { Component } from '../core/Component';
import { Curve, CurveType } from '../math/Curve';
import vec3 from '../math/vec3';
import { TileController } from './TileController';

export class SolidTile extends TileController {
  async initialize(): Promise<void> {
    console.debug('creating a solid tile');
    this.updateCollision();
  }

  update(dt: number): void {}
}
