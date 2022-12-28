import { SpriteFlip } from '../core/Sprite';

/**
 * Interface for setting a sprite
 */
export interface ISpriteController {
  /**
   * Sets the sprite
   * @param id id into the sprite sheet.
   * @param flip if the sprite should be flipped in some way.
   */
  setSprite(id: string, flip?: SpriteFlip): void;
}
