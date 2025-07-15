import { Texture } from '../graphics/Texture';
import { Component } from '../core/Component';
import { ILevelData } from '../data/ILevelData';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class Scene extends Component {
  private _spriteSheetTexture: Texture;

  get spriteSheetTexture(): Texture {
    return this._spriteSheetTexture;
  }

  get type(): string {
    return typeof this;
  }

  async loadLevel(level: ILevelData): Promise<void> {
    this.eng.dialogManager.showDialog({
      text: 'Welcome to Earth Quest!\nThis is a default scene for the engine',
      x: 20,
      y: 40,
      width: 600,
      height: 240,
    });
  }

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {
    // Clear the canvas before we start drawing on it.
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
