import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { ILevelData } from '../environment/ILevelData';
import { Component } from './Component';

/**
 * This is a base class for a scene
 */
export abstract class SceneComponent extends Component {

  private _levelData: ILevelData;

  /**
   * Get the static level data used to create this scene.
   */
  get levelData(): ILevelData {
    return this._levelData;
  }

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
   * Show scene is called when a SceneManager changes to a new scene.
   */
  loadLevel(level: ILevelData): void {
    this._levelData = level;
  }
}
