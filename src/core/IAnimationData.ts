import { AnimationController } from './AnimationController';
import { SpriteFlip } from './Sprite';

export enum AnimationDoneAction {
  None,
  Repeat,
  PingPong,
}

export interface IAnimationData {
  /**
   * This event is fired when the animation start before any sprite is
   * changed.
   */
  onStart?: (ctrl: AnimationController) => void;
  /**
   * This event is fired Every frame of the animation
   * changed.
   */
  onUpdate?: (ctrl: AnimationController) => void;
  /**
   * This event is fired when the animation is done
   * changed.
   */
  OnDone?: (ctrl: AnimationController) => void;

  /**
   * What to do when the animation is done.
   */
  doneAction?: AnimationDoneAction;

  /**
   * Should the animation run backwards
   */
  AnimateBackwards?: boolean;

  /**
   * default is frame 0
   */
  startFrame?: number;

  /**
   * last frame default is Nth frame
   */
  endFrame?: number;

  /**
   * The frame rate is 30fps by default
   */
  frameRate?: number;

  /**
   * The animations. The Id will map to something in the spriteSheet and
   * sec is when the sprite should be switched to this id.
   */
  clip: { id: string; frame: number; flip: SpriteFlip }[];
}
