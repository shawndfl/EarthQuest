import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritController } from '../graphics/SpriteController';
import { TileComponent } from './TileComponent';
import CharacterData from '../assets/characters.json';
import { TileFactory } from '../systems/TileFactory';

export class NpcComponent extends TileComponent {
  protected _spriteController: SpritController;
  protected _type;
  protected _tileId;
  protected _spriteId;

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
  }

  update(dt: number) {
    this._spriteController.update(dt);
  }
}
