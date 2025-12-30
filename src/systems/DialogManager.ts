import { Component } from '../core/Component';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DrawingLayer } from '../drawingLayers/DrawingLayer';
import { UiDrawingLayer } from '../drawingLayers/UIDrawingLayer';

import mat4 from '../math/mat4';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { DialogComponent } from '../ui/dialogs/DialogComponent';
import { DialogOptions } from '../ui/dialogs/DialogOptions';

export const defaultDialogDepth = -0.5;

export const MaxDialogCount = 5;

//TODO
// Support multiple dialog
// support options
// Print character at a time
// input to continue
// menu for status
// menu for equip
// menu for items
// menu for help

/**
 * Manages dialog boxes
 */
export class DialogManager extends Component {
  private _drawingLayer: UiDrawingLayer;

  get drawingLayer(): DrawingLayer {
    return this._drawingLayer;
  }

  private _dialogBox: DialogComponent;

  /**
   * Create the shader and projection matrix used for all menus
   */
  async initialize(): Promise<void> {
    this._drawingLayer = new UiDrawingLayer(this.eng, 'default');

    this._dialogBox = await this.createMainDialogComponent();
  }

  async createMainDialogComponent(): Promise<DialogComponent> {
    return new DialogComponent(this.eng);
  }

  async loadLevel(): Promise<void> {
    await this.drawingLayer.loadLevel();
  }

  closeLevel(): void {
    this.drawingLayer.closeLevel();
  }

  showDialog(dialogOptions: DialogOptions): void {
    this._dialogBox.show(dialogOptions);
  }

  hideDialog(): void {}

  dialogHasFocus(): boolean {
    return this._dialogBox.isVisible;
  }

  update(dt: number): void {
    this.drawingLayer.update(dt);

    this._dialogBox.update(dt);
  }
}
