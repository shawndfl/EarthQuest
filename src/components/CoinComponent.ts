import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { CollideTileComponent } from '../components/CollideTileComponent';
import { TileComponent } from './TileComponent';
import { Curve, CurveType } from '../math/Curve';

export class CoinComponents extends CollideTileComponent {
  private _collected: boolean;
  private _idleCurve: Curve;
  /** The name of the sprite without the .1, .2, etc. */
  private _baseSprite: string;

  canAccessTile(tileComponent: TileComponent): boolean {
    return true;
  }

  onEnter(tileComponent: TileComponent) {
    if (!this._collected) {
      console.debug('collect coin');

      this._spriteController.removeSprite(this._tileId);
      this._collected = true;
    }
  }

  constructor(
    eng: Engine,
    protected _spriteController: SpritBatchController,
    typeAndSprite: string,
    i: number,
    j: number,
    k: number
  ) {
    super(eng, _spriteController, typeAndSprite, i, j, k);
    this._baseSprite = this._spriteId.split('.')[0];
    this._collected = false;
    this._idleCurve = new Curve();
    this._idleCurve.points([
      {
        p: 0,
        t: 0,
      },
      {
        p: 1,
        t: 500,
      },
      {
        p: 2,
        t: 1000,
      },
      {
        p: 0,
        t: 1500,
      },
    ]);
    this._idleCurve.repeat(-1);
    this._idleCurve.start(true, undefined, (val) => {
      if (!this._collected) {
        this._spriteController.activeSprite(this._tileId);
        this._spriteId = this._baseSprite + '.' + val;
        this._spriteController.setSprite(this._spriteId);
      }
    });
    // we have animations so register for updates
    this.groundManager.registerForUpdate(this);
  }

  update(dt: number) {
    this._idleCurve.update(dt);
  }
}
