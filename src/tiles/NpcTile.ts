import { Curve } from '../math/Curve';
import { RigidBodyTile } from './RigidBodyTile';

export class NpcTile extends RigidBodyTile {
  private curve: Curve;

  async initialize(): Promise<void> {
    await super.initialize();
    this.curve = new Curve();
    this.curve.points([
      { p: 0, t: 0 },
      { p: 1, t: 1000 },
      { p: 0, t: 2000 },
    ]);
    this.curve.repeat(-1);

    this.curve.start(true, undefined, (value) => {
      //TODO toggle the image over time
      this.quad.mirrorX = !!value;
      this.requestGeometryRefresh();
    });
  }

  update(dt: number): void {
    this.curve.update(dt);
  }
}
