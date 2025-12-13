import { Curve, CurveType } from '../math/Curve';
import vec2 from '../math/vec2';
import { TileController } from './TileController';

/**
 * This tile creates a fire fly
 */
export class FireFlyTile extends TileController {
  private curve: Curve;

  async initialize(): Promise<void> {
    await super.initialize();
    this.curve = new Curve();
    this.curve.points([
      { p: 0, t: 0 },
      { p: 1, t: 1000 },
      { p: 0, t: 2000 },
    ]);
    this.curve.pingPong(true);
    this.curve.repeat(-1);
    this.curve.curve(CurveType.linear);
    const offset = new vec2();
    const xOffset = 1;
    const yOffset = 5;
    //this.tileData.alpha = 0.05;

    // This will make the firefly bounce around
    this.curve.start(true, undefined, (value) => {
      offset.x = xOffset * value * value;
      offset.y = yOffset * value * value;
      this.tileData.setTileTransform({ offset });
      this.requestGeometryRefresh();
    });
  }

  update(dt: number): void {
    this.curve.update(dt);
  }
}
