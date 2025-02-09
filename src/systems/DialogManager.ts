import { Component } from '../components/Component';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Engine } from '../core/Engine';
import { DialogComponent } from '../menus/DialogComponent';
import { InputState } from '../core/InputHandler';
import { GameMenuComponent } from '../menus/GameMenuComponent';
import { DialogBuilder } from '../menus/DialogBuilder';
import { GameMenuBuilder } from '../menus/GameMenuBuilder';

export const defaultDialogDepth = -0.5;

/**
 * Interface for creating a dialog
 */
export interface DialogOptions {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onClosed?: (dialog: DialogComponent) => void;
  choices?: string[];
  onClosing?: (dialog: DialogComponent) => boolean;
  depth?: number; // = -0.5
}

export const MaxDialogCount = 5;

/**
 * Manages dialog boxes
 */
export class DialogManager extends Component {
  protected _spriteController: SpritBatchController;
  protected _dialogQueue: DialogComponent[] = [];
  protected _gameMenu: GameMenuComponent;
  protected _dialogBuild: DialogBuilder;
  protected _gameMenuBuilder: GameMenuBuilder;
  protected _dialogIndex: number = -1;

  /**
   * Get the game menu
   */
  get gameMenu() {
    return this._gameMenu;
  }

  /**
   * Get the dialog menu
   */
  get dialog() {
    return this._dialogIndex < 0 || this._dialogIndex > this._dialogQueue.length - 1
      ? null
      : this._dialogQueue[this._dialogIndex];
  }

  constructor(eng: Engine) {
    super(eng);

    this._dialogBuild = new DialogBuilder(eng);
    this._gameMenuBuilder = new GameMenuBuilder(eng);
    this._spriteController = new SpritBatchController(eng);
    // add all the dialogs
    for (let i = 0; i < MaxDialogCount; i++) {
      this._dialogQueue.push(new DialogComponent(this.eng, this._dialogBuild, 'dialog' + i));
    }

    this._gameMenu = new GameMenuComponent(this.eng, 'gameMenu', this._gameMenuBuilder);
  }

  async initialize() {
    const texture = this.eng.assetManager.menu.texture;
    const data = this.eng.assetManager.menu.data;
    this._spriteController.initialize(texture, data);
    for (let i = 0; i < MaxDialogCount; i++) {
      this._dialogQueue[i].initialize(this._spriteController);
    }
    this._gameMenu.initialize(this._spriteController);
    this._spriteController.commitToBuffer();
  }

  /**
   * Handles user actions for the menu
   * @param action
   * @returns
   */
  handleUserAction(state: InputState): boolean {
    if (this.dialog) {
      return this.dialog.handleUserAction(state) || this._gameMenu.handleUserAction(state);
    } else {
      return this._gameMenu.handleUserAction(state);
    }
  }

  /**
   * Shows a dialog box
   * @param text
   * @param loc
   */
  showDialog(options: DialogOptions) {
    if (this.dialog) {
      this.dialog.activate(false);
    }

    // get ready for the next dialog
    this._dialogIndex++;

    this.dialog.setOptions(options.choices);
    this.dialog.setPosition(options.x, options.y);
    this.dialog.setSize(options.width, options.height);
    this.dialog.setText(options.text);
    this.dialog.onClosing = options.onClosing;
    this.dialog.setDepth(defaultDialogDepth - 0.01 * this._dialogIndex);
    this.dialog.onClosed = (dialog) => {
      if (this.dialog) {
        this.dialog.activate(false);
      }
      this._dialogIndex--;
      if (options.onClosed) {
        options.onClosed(dialog);
      }
      if (this.dialog) {
        this.dialog.activate(true);
      }
    };

    this.dialog.show();
    this.dialog.activate(true);
  }

  showGameMenu(onHide?: (dialog: GameMenuComponent) => boolean) {
    this._gameMenu.onHide = onHide;
    this._gameMenu.show();
  }

  /**
   * Updates the dialog box
   * @param dt
   */
  update(dt: number) {
    // update all dialogs
    for (let i = 0; i < this._dialogIndex + 1; i++) {
      this._dialogQueue[i].update(dt);
    }
    this._gameMenu.update(dt);
    this._spriteController.update(dt);
  }

  closeLevel(): void {
    this._gameMenu.hide();

    // hide all dialogs
    for (let i = 0; i < this._dialogIndex + 1; i++) {
      this._dialogQueue[i].hide();
    }

    this._dialogIndex = -1;
  }
}
