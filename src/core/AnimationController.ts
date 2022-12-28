import { ISpriteController } from '../environment/ISprintController';
import { SpritController } from '../environment/SpriteController';
import { IAnimationData } from './IAnimationData';

/**
 * Controls the animation and raises events to listeners provided in IAnimationData
 */
export class AnimationController {
  /** The current frame index of the animation clip */
  private _frameIndex: number;
  private _firstFrame: number;
  private _lastFrame: number;
  /** frame rate is frame per second default is 30 */
  private _frameRate: number;
  private _animationTime: number;
  private _isCancelled: boolean;
  private _isDone: boolean;
  private _animation: IAnimationData;

  get frameRate(): number {
    return this._frameRate;
  }

  get isDone(): boolean {
    return this._isDone;
  }

  constructor(private _spriteController: ISpriteController) {
    this._animationTime = 0;
    this._frameIndex = 0;
    this._frameRate = 30;
    this._firstFrame = 0;
    this._lastFrame = 0;
  }

  start(animation: IAnimationData) {
    this._animation = animation;
    this._frameIndex = 0;
    this._frameRate = this._animation.frameRate ?? 30;
    this._firstFrame = 0;
    this._lastFrame =
      this._animation.endFrame ?? this._animation.clip.length - 1;

    // raise start event
    if (this._animation.onStart) {
      this._animation.onStart(this);
    }

    // set the first index
    this._frameIndex = this._animation.AnimateBackwards
      ? this._lastFrame
      : this._firstFrame;

    // get the first frame
    const frame = this._animation.clip[this._frameIndex];

    // set the animation timer to the start time of the animation
    this._animationTime = frame.frame * this._frameRate;

    // set the sprite to the first frame
    this._spriteController.setSprite(frame.id, frame.flip);
  }

  cancel() {}

  update(dt: number) {
    const currentFrame = this._animation.clip[this._frameIndex];
    const nextFrame = this._animation.clip[this._frameIndex + 1];

    // if we have a next frame and its not past the
    // last frame of this animation
    if (nextFrame && nextFrame.frame <= this._lastFrame) {
      const nextFrameTime = nextFrame.frame * this._frameRate;
    }

    // update the animation timer
    this._animationTime += dt;
  }
}
