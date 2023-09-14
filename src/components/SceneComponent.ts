import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { ILevelData } from '../environment/ILevelData';
import { DialogMenu } from '../menus/DialogMenu';
import { GroundManager } from '../systems/GroundManager';
import { Component } from './Component';
import { PlayerController } from './PlayerController';

/**
 * This is a base class for a scene
 */
export abstract class SceneComponent extends Component {

  private _levelData: ILevelData;

  /**
   * This manages the ground tiles for the level
   */
  abstract get ground(): GroundManager;

  /**
   * Get the static level data used to create this scene.
   */
  get levelData(): ILevelData {
    return this._levelData;
  }

  /**
   * The player sprite controller
   */
  abstract get player(): PlayerController;

  /**
   * A way of displaying dialog on the scene
   */
  abstract get dialog(): DialogMenu;

  /**
   * Get the scene type
   */
  abstract get type(): string;

  /**
   * constructor
   * @param eng
   */
  constructor(eng: Engine) {
    super(eng);
  }

  /**
   * Initialize the scene
   * @param options
   */
  async initialize(level: ILevelData) {
    this._levelData = level;
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
  abstract handleUserAction(action: InputState): boolean;

  /**
   * Called every frame
   * @param dt
   */
  update(dt: number) { }

  /**
   * Show scene is called when a SceneManager changes to a new scene.
   */
  ShowScene() { }

  /**
   * Hide scene is called when a SceneManager changes to a new scene.
   */
  HideScene() { }

  /**
   * When the window is resized
   */
  resize(width: number, height: number) { }

  /**
   * Dispose the scene
   */
  dispose() { }
}
