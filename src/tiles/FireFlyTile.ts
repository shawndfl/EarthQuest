import { Curve, CurveType } from '../math/Curve';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { TileController } from './TileController';

/**
 * This tile creates a fire fly
 */
export class FireFlyTile extends TileController {
  private curve: Curve;

  async initialize(): Promise<void> {
    this.curve = new Curve();
    this.curve.points([
      { p: 0, t: 0 },
      { p: 1, t: 1000 },
      { p: 1, t: 1050 },
    ]);
    this.curve.pingPong(true);
    this.curve.repeat(-1);
    this.curve.curve(CurveType.linear);
    const startPosition = this.tilePosition.copy();
    const position = this.tilePosition.copy();
    const xOffset = 0;
    const yOffset = 100;
    //this.tileData.alpha = 0.05;

    // This will make the firefly bounce around
    this.curve.start(true, undefined, (value, time) => {
      position.x = startPosition.x; // + xOffset * value;
      position.y = startPosition.y + yOffset * value;
      const alpha = value;
      this.alpha = alpha * 0.5 + 0.5;
      const scale = 10 * value + 10;
      const rotate = 360 * value;

      this.setTileTransform({
        position: position,
        tileSize: new vec2(scale, scale),
        rotation: rotate,
        offset: new vec2(0, 0),
        depthBias: -70,
      });
    });
  }

  update(dt: number): void {
    this.curve.update(dt);
  }
}
