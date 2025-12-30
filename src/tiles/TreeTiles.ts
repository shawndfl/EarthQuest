import { Curve, CurveType } from '../math/Curve';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { CollisionTile } from './CollisionTile';

export class TreeTile extends CollisionTile {
  private curve: Curve;
  async initialize(): Promise<void> {
    this.curve = new Curve();
    this.curve.curve(CurveType.discreet);
    this.curve.repeat(-1);
    this.curve.points([
      { p: 0, t: 0 },
      { p: 1, t: 1000 },
      { p: 2, t: 2000 },
      { p: 3, t: 3000 },
      { p: 4, t: 4000 },
      { p: 0, t: 5000 },
    ]);
    this.curve.start(false, undefined, (v) => {
      //console.debug('tree ' + v);
      const imageNames = this.getImageNames();

      // requests refresh
      this.setImage(imageNames[v]);

      this.updateCollision();

      this.eng.debugHelpers.setRect('tree', this._bounds, new vec4(0, 0.5, 1, 1));
    });
  }

  update(dt: number): void {
    this.curve.update(dt);
  }
}
