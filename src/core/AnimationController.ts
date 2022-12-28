import { SpritController } from '../environment/SpriteController';
import { IAnimationData } from './IAnimationData';

/**
 * Controls the animation and raises events to listeners provided in IAnimationData
 */
export class AnimationController {
  private _frameIndex: number;
  private _firstFrame: number;
  private _lastFrame: number;
  private _frameRate: number;
  private _animationTimer: number;
  private _isCancelled: boolean;
  private _isDone: boolean;
  private _animation: IAnimationData;

  get isDone(): boolean {
    return this._isDone;
  }

  constructor(private _spriteController: SpritController) {
    this._animationTimer = 0;
    this._frameIndex = 0;
    this._frameRate = 30;
    this._firstFrame = 0;
    this._lastFrame = 0;
  }

  start(animation: IAnimationData) {
    this._animation = animation;
    this._animationTimer = 0;
    this._frameIndex = 0;
    this._frameRate = this._animation.frameRate ?? 30;
    this._firstFrame = 0;
    this._lastFrame =
      this._animation.endFrame ?? this._animation.clip.length - 1;

    // raise start event
    this._animation?.onStart(this);

    // set the first index
    this._frameIndex = this._animation.AnimateBackwards
      ? this._lastFrame
      : this._firstFrame;

    // get the first frame
    const frame = this._animation.clip[this._frameIndex];

    // set the sprite to the first frame
    this._spriteController.setSprite(frame.id, frame.flip);
  }

  cancel() {}

  update(dt: number) {}
}
