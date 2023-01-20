import { Texture } from '../graphics/Texture';
import CharacterImage from '../assets/characters.png';
import CharacterData from '../assets/characters.json';
import { GroundManager } from '../systems/GroundManager';
import { PlayerController } from '../components/PlayerController';
import { Engine } from '../core/Engine';
import { UserAction } from '../core/UserAction';
import { CreateSimpleAnimationClip } from '../utilities/CreateSimpleAnimationClip';
import { DialogMenu } from '../menus/DialogMenu';
import { SceneComponent } from '../components/SceneComponent';
import { ILevelData } from './ILevelData';
import { LevelGenerator } from './LevelGenerator';
import { InputState } from '../core/InputHandler';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class WorldScene extends SceneComponent {
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

  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(eng: Engine) {
    super(eng);

    this._spriteSheetTexture = new Texture(this.gl);
    this._ground = new GroundManager(eng);
    this._player = new PlayerController(eng);
    this._dialog = new DialogMenu(eng);
  }

  /**
   * Sets up the scene
   */
  async initialize(options: { level: ILevelData }) {
    CreateSimpleAnimationClip.create(CharacterData);
    await this.spriteSheetTexture.loadImage(CharacterImage);

    this.ground.initialize(options.level);
    this.player.initialize(this.spriteSheetTexture, CharacterData);

    await this.dialog.initialize();
  }
  /**
   * Handles user input. The logic goes through a chain of commands
   *    1) Main menu
   *    2) pause menu
   *    3) battle menu
   *    4) dialog menu
   *    5) player in the environment
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(state: InputState): boolean {
    //console.debug('user action ', action);
    // handle main menu, pause menu, battles menu, dialog menu, environment

    return this.eng.dialogManager.handleUserAction(state) || this.player.handleUserAction(state);
  }

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {
    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.ground.update(dt);

    this.player.update(dt);

    //this.spriteDebugger.update(dt);

    this.dialog.update(dt);
  }

  resize(width: number, height: number) {}

  dispose() {
    console.log('dispose');
  }
}
