import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { CollideTileComponent } from './CollideTileComponent';
import { TileComponent } from './TileComponent';
import { Curve, CurveType } from '../math/Curve';
import { TileContext } from './TileContext';
import { ITileCreateionArgs } from './ITileCreationArgs';

export class GoldComponents extends CollideTileComponent {
  private _collected: boolean;
  private _idleCurve: Curve;
  /** The name of the sprite without the .1, .2, etc. */
  private _baseSprite: string;

  canAccessTile(tileComponent: TileComponent): boolean {
    return true;
  }

  onEnter(tileComponent: TileComponent, tileContext: TileContext) {
    if (!this._collected) {
      console.debug('collect coin');

      this._spriteController.removeSprite(this.id);
      // keep track of the gold created
      this.eng.gameManager.data.player.gold++;

      console.debug('gold collected ' + this.eng.gameManager.data.player.gold);

      this._collected = true;
    }
  }

  constructor(
    eng: Engine,
    spriteController: SpritBatchController,
    args: ITileCreateionArgs
  ) {
    super(eng, spriteController, args);
    this._baseSprite = this.spriteId.split('.')[0];
    this._collected = false;
    this._idleCurve = new Curve();
    this._idleCurve.points([
      {
        p: 0,
        t: 0,
      },
      {
        p: 1,
        t: 1000,
      },
      {
        p: 2,
        t: 1200,
      },
      {
        p: 0,
        t: 1500,
      },
    ]);
    this._idleCurve.repeat(-1);
    //this._idleCurve.pingPong(true);
    this._idleCurve.start(true, undefined, (val) => {
      if (!this._collected) {
        this._spriteController.activeSprite(this.id);
        const spriteId = this._baseSprite + '.' + val;
        this._spriteController.setSprite(spriteId);
      }
    });
    // we have animations so register for updates
    this.groundManager.registerForUpdate(this);

    // keep track of the gold created
    this.eng.gameManager.data.environment.gold++;
  }

  update(dt: number) {
    this._idleCurve.update(dt);
  }
}
