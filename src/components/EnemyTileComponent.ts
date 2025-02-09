import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';
import { SpriteFlip } from '../graphics/Sprite';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Curve } from '../math/Curve';
import { ITileCreateionArgs } from './ITileCreationArgs';
import { PlayerController } from './PlayerController';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

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
  private _moveSpeed = 0.01;

  private _isDead: boolean;

  onPlayerAction(tileComponent: TileComponent): void {
    if (tileComponent instanceof PlayerController && !this._isDead) {
      const player = tileComponent as PlayerController;
      if (player.attacking) {
        this._spriteController.removeSprite(this.id);
        this._spriteController.commitToBuffer();
        this.groundManager.removeTile(this);
        this._isDead = true;
      }
    }
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    if (tileComponent.type == 'player') {
      return true;
    } else {
      return false;
    }
  }

  onEnter(tileComponent: TileComponent, context: TileContext): void {
    if (tileComponent.type == 'player') {
      this.eng.assetManager.requestJson('assets/levels/battle1.json').then((levelData: ILevelData) => {
        const pos = this.eng.player.tilePosition;
        this.eng.gameManager.data.player.position = { i: pos.x, j: pos.y, k: pos.z };
        this.eng.pushNewLevel(levelData);
        //TODO fade in
      });
      //TODO fad out
    }
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  constructor(eng: Engine, spriteController: SpritBatchController, args: ITileCreateionArgs) {
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

    this._spriteController.flip(this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None);
    this._spriteController.setSprite(this._sprites[index]);

    const playerLocal = this.eng.player.tilePosition.copy();
    const walkingDirection = playerLocal.subtract(this.tilePosition).normalize();

    // scale velocity by time
    const moveVector = walkingDirection.scale(this._moveSpeed);

    // screen space converted to tile space for x and y position (ground plane)
    // then use the movement dot of the slope vector which will allow the player for
    // move up and down on stairs and slops
    this.groundManager.placeTileOn(this, moveVector.x, moveVector.y);
  }

  dispose(): void {
    this.spriteController?.dispose();
  }
}
