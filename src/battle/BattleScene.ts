import { Component } from '../components/Component';
import { PlayerController } from '../components/PlayerController';
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { UserAction } from '../core/UserAction';
import { ILevelData } from '../environment/ILevelData';
import { Texture } from '../graphics/Texture';
import { DialogMenu } from '../menus/DialogMenu';
import { GroundManager } from '../systems/GroundManager';
import CharacterImage from '../assets/characters.png';
import CharacterData from '../assets/characters.json';

/**
 * This is the scene for the battle
 */
export class BattleScene extends SceneComponent {
  private _spriteSheetTexture: Texture;
  private _ground: GroundManager;
  private _player: PlayerController;
  private _dialog: DialogMenu;

  get spriteSheetTexture(): Texture {
    return this._spriteSheetTexture;
  }
  get ground(): GroundManager {
    return this._ground;
  }
  get player(): PlayerController {
    return this._player;
  }
  get dialog(): DialogMenu {
    return this._dialog;
  }

  constructor(eng: Engine) {
    super(eng);
    this._spriteSheetTexture = new Texture(this.gl);
    this._ground = new GroundManager(eng);
    this._player = new PlayerController(eng);
    this._dialog = new DialogMenu(eng);
  }

  /**
   * Handle user input
   * @param action
   */
  handleUserAction(action: UserAction): boolean {
    return true;
  }

  /**
   * Initialize
   * @param options
   */
  async initialize(options: { level: ILevelData }) {
    await this.spriteSheetTexture.loadImage(CharacterImage);

    this.ground.initialize(options.level);
    this.player.initialize(this.spriteSheetTexture, CharacterData);

    await this.dialog.initialize();
  }

  /**
   * Update
   * @param dt
   */
  update(dt: number) {}
}
