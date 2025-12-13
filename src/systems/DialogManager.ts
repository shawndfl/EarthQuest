import { Component } from '../core/Component';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { DialogComponent } from '../dialogs/DialogComponent';

import { Texture } from '../graphics/Texture';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';

import vec4 from '../math/vec4';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';

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
  private _texture: Texture;
  private _menuTitle: RuntimeTileData;
  private _dialogBox: DialogComponent;
  private _shader: SpritePerspectiveShader;
  protected _projection: mat4;

  async initialize(): Promise<void> {
    this._shader = new SpritePerspectiveShader(this.gl, 'dialogShader');
    this._projection = mat4.orthographic(0, this.eng.width, 0, this.eng.height, 1, -1, this._projection);
  }

  async loadLevel(): Promise<void> {
    const name = 'Dialog Menu';
    const tileAtlas = this.eng.assetManager.atlasData['default'];
    const tileData = tileAtlas.tiles[name];
    this._texture = await this.eng.assetManager.getTexture(tileAtlas.texture);
    this._menuTitle = new RuntimeTileData(this.eng, name, tileData, this._texture);

    if (!this._menuTitle) {
      console.error('Cannot find menu title');
      return;
    }

    // setup the shader
    this._shader.setSpriteSheet(this._texture);
    this._dialogBox = new DialogComponent(this.eng, this._menuTitle, this._texture);
  }

  showDialog(): void {
    const pos = new vec2(0, 100);
    this._dialogBox.setText('dialog1', ' Hello', 0, 0, new vec4(0, 0.2, 6, 1));
    this._dialogBox.show(pos, 200, 100, 1.0);
  }

  hideDialog(): void {
    this.hideDialog();
  }

  dialogHasFocus(): boolean {
    return this._dialogBox.isVisible;
  }

  update(dt: number): void {
    this._shader.enable();

    const proj = this._projection;

    this._shader.setProj(proj);

    this._dialogBox.update(dt);
  }
}
