import { Engine } from '../core/Engine';
import { SpriteFlip } from '../graphics/Sprite';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve } from '../math/Curve';
import { ITileCreationArgs } from './ITileCreationArgs';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

export class PlayerBattleTileComponent extends TileComponent {
  /** Sprite animation */
  protected _sprites: string[];
  private _spriteController: SpritBatchController;
  /** the walk animation. This is just two frames */
  protected _idleAnimation: Curve;
  /** Should the sprites be flipped */
  private _spriteFlip: boolean;
  private _moveCounter = 0;
  private _moveSpeed = 0.01;

  private _isDead: boolean;

  onPlayerAction(tileComponent: TileComponent): void {
    //NOP
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    return false;
  }

  onEnter(tileComponent: TileComponent, context: TileContext): void {
    //NOP
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  constructor(eng: Engine, spriteController: SpritBatchController, args: ITileCreationArgs) {
    super(eng, args);

    this._spriteController = new SpritBatchController(eng);
    const character = eng.assetManager.character;
    this._spriteController.initialize(character.texture, character.data);

    this._spriteController.activeSprite(this.id);
    this._spriteController.setSprite(this.spriteId);
    this._spriteController.scale(this.eng.tileScale);

    this.setTilePosition(args.i, args.j, args.k);
    this._spriteController.commitToBuffer();

    this._idleAnimation = new Curve();
    this._idleAnimation
      .points([
        { p: 1, t: 0 },
        { p: 0, t: 200 },
        { p: 1, t: 400 },
      ])
      .repeat(-1);
    this._idleAnimation.start(true);

    // this tile will be animated
    this.groundManager.registerForUpdate(this);
  }

  update(dt: number) {
    if (!this._isDead) {
      this._spriteController.update(dt);
      this.runIdle(dt);
    }
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

    this._spriteController.flip(this._spriteFlip ? SpriteFlip.FlipX : SpriteFlip.None);
    this._spriteController.setSprite(this._sprites[index]);
  }

  dispose(): void {
    this.spriteController?.dispose();
  }
}
