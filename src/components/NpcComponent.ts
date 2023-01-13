import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritController } from '../graphics/SpriteController';
import { TileComponent } from './TileComponent';
import CharacterData from '../assets/characters.json';
import { TileFactory } from '../systems/TileFactory';
import { Curve } from '../math/Curve';
import { SpriteFlip } from '../graphics/Sprite';

export class NpcComponent extends TileComponent {
  protected _spriteController: SpritController;
  protected _type;
  protected _tileId;
  protected _spriteId;

  /** Sprite animation */
  protected _sprites: string[];
  /** the walk animation. This is just two frames */
  protected _idleAnimation: Curve;
  /** Should the sprites be flipped */
  private _spriteFlip: boolean;

  /**
   * This does require update
   */
  get requiresUpdate(): boolean {
    return true;
  }

  get spriteController(): SpritBaseController {
    return this._spriteController;
  }
  get id(): string {
    return this._tileId;
  }

  get type(): string {
    return 'npc.poo';
  }

  constructor(
    eng: Engine,
    typeAndSprite: string,
    i: number,
    j: number,
    k: number
  ) {
    super(eng);
    const parts = typeAndSprite.split('|');
    this._type = parts[0];
    this._spriteId = parts[1];
    this._tileId = TileFactory.createStaticID(i, j, k);

    this._spriteController = new SpritController(eng);
    this._spriteController.initialize(
      this.eng.scene.spriteSheetTexture,
      CharacterData
    );

    this._spriteController.scale(this.eng.tileScale);
    this._spriteController.setSprite('poo.down.step');

    this.setTilePosition(i + 0.5, j + 0.5, k);

    this._idleAnimation = new Curve();
    this._idleAnimation
      .points([
        { p: 1, t: 0 },
        { p: 0, t: 600 },
        { p: 1, t: 1200 },
      ])
      .repeat(-1);
    this._idleAnimation.start(true);
  }

  update(dt: number) {
    this._spriteController.update(dt);
    this.runIdle(dt);
  }

  runIdle(dt: number) {
    this._idleAnimation.update(dt);
    this._sprites = ['poo.down.step', 'poo.down.step'];

    const index = this._idleAnimation.getValue();
    if (index == 0) {
      this._spriteFlip = true;
    } else if (index == 1) {
      this._spriteFlip = false;
    }

    this._spriteController.setFlip(
      this._spriteFlip ? SpriteFlip.XFlip : SpriteFlip.None
    );
    this._spriteController.setSprite(this._sprites[index], true);
  }
}
