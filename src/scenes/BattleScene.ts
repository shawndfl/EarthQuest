import { Component } from '../components/Component';
import { PlayerController } from '../components/PlayerController';
import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { UserAction } from '../core/UserAction';
import { ILevelData } from '../environment/ILevelData';
import { Texture } from '../graphics/Texture';
import { DialogMenu } from '../menus/DialogMenu';
import { GroundManager } from '../systems/GroundManager';
import CharacterData from '../assets/characters.json';
import { InputState } from '../core/InputHandler';
import { BackgroundComponent } from '../components/BackgroundComponent';

/**
 * This is the scene for the battle
 */
export class BattleScene extends SceneComponent {
  private _spriteSheetTexture: Texture;
  private _ground: GroundManager;
  private _player: PlayerController;
  private _dialog: DialogMenu;
  private _background: BackgroundComponent;

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

  get type(): string {
    return 'battle';
  }

  constructor(eng: Engine) {
    super(eng);
    this._background = new BackgroundComponent(eng);
    this._spriteSheetTexture = new Texture(this.gl);
    this._ground = new GroundManager(eng);
    this._player = new PlayerController(eng);
    this._dialog = new DialogMenu(eng);
  }

  /**
   * Handle user input
   * @param action
   */
  handleUserAction(state: InputState): boolean {
    return true;
  }

  /**
   * Initialize
   * @param options
   */
  async initialize(options: { level: ILevelData }) {
    await this.dialog.initialize();
  }

  ShowScene(): void {
    this._background.initialize({ image: this.eng.assetManager.battle01.texture });
  }

  /**
   * Update
   * @param dt
   */
  update(dt: number) {
    // Clear the canvas before we start drawing on it.
    //this.gl.disable(this.gl.CULL_FACE);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this._background.update(dt);
  }
}
