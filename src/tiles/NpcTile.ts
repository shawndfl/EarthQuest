import { Curve } from '../math/Curve';
import { TileController } from './TileController';

export class NpcTile extends TileController {
  private curve: Curve;
  async initialize(): Promise<void> {
    this.curve = new Curve();
    this.curve.points([
      { p: 0, t: 0 },
      { p: 1, t: 1000 },
    ]);
    this.curve.start(true, undefined, (value) => {
      //TODO toggle the image over time
      this.options.tileData.images;
      this.quad.uvTransform;
    });
  }
  update(dt: number): void {
    this.curve.update(dt);
  }
}
