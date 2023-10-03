import { Engine } from '../core/Engine';
import { SpriteFlip } from '../graphics/Sprite';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { SpritController } from '../graphics/SpriteController';
import { Curve } from '../math/Curve';
import { ITileCreateionArgs } from './ITileCreationArgs';
import { TileComponent } from './TileComponent';

/**
 * This is any thing that the player or some NPC can walk on
 */
export class EnemyTileComponent extends TileComponent {

  /** Sprite animation */
  protected _sprites: string[];
  private _spriteController: SpritBatchController;
  /** the walk animation. This is just two frames */
  protected _idleAnimation: Curve;
  /** Should the sprites be flipped */
  private _spriteFlip: boolean;
  private _moveCounter = 0;
  private _moveSpeed = .010;

  canAccessTile(tileComponent: TileComponent): boolean {
    return false;
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  constructor(
    eng: Engine,
    spriteController: SpritBatchController,
    args: ITileCreateionArgs
  ) {
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

    this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
    this._spriteController.setSprite(this._sprites[index]);

    const playerLocal = this.eng.player.tilePosition.copy();
    const walkingDirection = playerLocal.subtract(this.tilePosition).normalize();

    // scale velocity by time
    const moveVector = walkingDirection.scale(this._moveSpeed);

    // screen space converted to tile space for x and y position (ground plane)
    // then use the movement dot of the slope vector which will allow the player for
    // move up and down on stairs and slops
    this.groundManager.offsetTile(this, moveVector.x, moveVector.y, 0);


  }

  dispose(): void {
    this.spriteController?.dispose();
  }
}
