import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritController } from '../graphics/SpriteController';
import { TileComponent } from './TileComponent';
import { Curve } from '../math/Curve';
import { SpriteFlip } from '../graphics/Sprite';
import { ITileCreateionArgs } from './ITileCreationArgs';

export class NpcComponent extends TileComponent {
  protected _spriteController;

  /** Sprite animation */
  protected _sprites: string[];
  /** the walk animation. This is just two frames */
  protected _idleAnimation: Curve;
  /** Should the sprites be flipped */
  private _spriteFlip: boolean;

  get spriteController(): SpritBaseController {
    return this._spriteController;
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    return false;
  }

  constructor(eng: Engine, args: ITileCreateionArgs) {
    super(eng, args);
    this._spriteController = new SpritController(eng);
    const i = args.i;
    const j = args.j;
    const k = args.k;

    this._spriteController = new SpritController(eng);
    const character = eng.assetManager.character;
    this._spriteController.initialize(character.texture, character.data);

    this._spriteController.scale(this.eng.tileScale);
    this._spriteController.setSprite(args.sprite);

    // offset by half so he stands in the middle of the tile
    this.setTilePosition(i + 0.5, j + 0.5, k);
    this._spriteController.commitToBuffer();

    this._idleAnimation = new Curve();
    this._idleAnimation
      .points([
        { p: 1, t: 0 },
        { p: 0, t: 600 },
        { p: 1, t: 1200 },
      ])
      .repeat(-1);
    this._idleAnimation.start(true);

    // this tile will be animated
    this.groundManager.registerForUpdate(this);
  }

  /**
   * Called when the player hits the action button
   * @param tileComponent
   */
  onPlayerAction(tileComponent: TileComponent) {
    this.eng.dialogManager.showDialog(
      'You want a piece of me?',
      { x: 20, y: 40, width: 400, height: 200 },
      (dialog) => {
        if (dialog.selectedOption == 'Fight') {
          this.yourScaringMe();
        } else {
          this.keepTraining();
        }

        return true;
      },
      ['Fight', 'Run Away']
    );
  }

  keepTraining() {
    this.eng.dialogManager.showDialog('You should be scared. Keep training!', {
      x: 10,
      y: 40,
      width: 600,
      height: 150,
    });
  }

  yourScaringMe() {
    this.eng.dialogManager.showDialog(
      "Your scaring me!! I don't really want to fight",
      {
        x: 10,
        y: 40,
        width: 600,
        height: 150,
      }
    );
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this.runIdle(dt);
  }

  runIdle(dt: number) {
    this._idleAnimation.update(dt);
    this._sprites = [this.spriteId, this.spriteId];

    const index = this._idleAnimation.getValue();
    if (index == 0) {
      this._spriteFlip = true;
    } else if (index == 1) {
      this._spriteFlip = false;
    }

    this._spriteController.flip(
      this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None
    );
    this._spriteController.setSprite(this._sprites[index]);
  }
}
