import { Group } from 'three';
import {
  AsepriteSprite,
  AsepriteSpriteSheet,
  assetManager,
  type AsepriteSpriteOptions,
} from '../assets';
import type { AssetManager } from '../assets/AssetManager';

export interface SpriteComponentOptions extends AsepriteSpriteOptions {
  imagePath?: string;
}

/** Owns the render root, loading, and animation state for an Aseprite sprite. */
export class SpriteComponent {
  readonly object = new Group();
  readonly ready: Promise<void>;
  sprite?: AsepriteSprite;
  error?: unknown;

  constructor(
    jsonPath: string,
    options: SpriteComponentOptions = {},
    assets: AssetManager = assetManager,
  ) {
    this.ready = this.load(assets, jsonPath, options).catch((error: unknown) => {
      this.error = error;
      console.error(`Unable to load sprite sheet "${jsonPath}"`, error);
    });
  }

  update(deltaSeconds: number): void {
    this.sprite?.update(deltaSeconds);
  }

  play(animation: string, restart = false): void {
    this.sprite?.play(animation, restart);
  }

  isPlaying(): boolean {
    return !!this.sprite?.isPlaying();
  }

  pause(): void {
    this.sprite?.pause();
  }

  setFrame(frame: number): void {
    this.sprite?.setFrame(frame);
  }

  setFlipHorizontal(flipped: boolean): void {
    if (this.sprite) this.sprite.flipHorizontal = flipped;
  }

  setFlipVertical(flipped: boolean): void {
    if (this.sprite) this.sprite.flipVertical = flipped;
  }

  dispose(): void {
    if (!this.sprite) return;
    this.object.remove(this.sprite);
    this.sprite.dispose();
    this.sprite = undefined;
  }

  private async load(
    assets: AssetManager,
    jsonPath: string,
    options: SpriteComponentOptions,
  ): Promise<void> {
    const sheet = await AsepriteSpriteSheet.load(assets, jsonPath, options.imagePath);
    const sprite = sheet.createSprite(options);
    this.object.add(sprite);
    this.sprite = sprite;
  }
}
