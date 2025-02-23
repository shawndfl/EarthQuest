import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { ILevelData } from '../environment/ILevelData';
import { GroundManager } from '../systems/GroundManager';
import { Component } from './Component';

/**
 * This is a base class for a scene
 */
export abstract class SceneComponent extends Component {
  /**
   * Get the scene type
   */
  abstract get type(): string;

  private _ground: GroundManager;

  public get ground(): GroundManager {
    return this._ground;
  }

  /**
   * constructor
   * @param eng
   */
  constructor(eng: Engine) {
    super(eng);
    this._ground = new GroundManager(this.eng);
  }

  initialize(): void {
    this._ground.initialize();
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

  async loadLevel(level: ILevelData): Promise<void> {
    await this._ground.loadLevel(level);
  }

  async loadBattle(level: ILevelData): Promise<void> {
    await this._ground.loadLevel(level);
  }

  closeLevel(): void {
    this._ground.closeLevel();
  }

  update(dt: number): void {
    this._ground.update(dt);
  }
}
