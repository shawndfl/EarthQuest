import { cli } from 'webpack';
import { ISpriteController } from '../environment/ISprintController';
import { SpritController } from '../environment/SpriteController';
import {
  AnimationEvent,
  IAnimationData,
  IAnimationFrame,
} from './IAnimationData';

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
  private _clip: IAnimationFrame[];

  private _currentFrame: IAnimationFrame;

  get currentFrame() {
    return this._currentFrame;
  }

  get animationTime(): number {
    return this._animationTime;
  }

  get clip() {
    return this._clip;
  }

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

    // make a copy of the clip and sort it by frame number.
    this._clip = animation.clip.slice().sort((a, b) => a.frame - b.frame);

    // raise start event
    if (this._animation.onStart) {
      this._animation.onStart(this);
    }

    const firstIndex = this.findClosetFrame(
      this._animation.startFrame ?? 0,
      this._clip
    );
    const lastIndex = this.findClosetFrame(
      this._animation.endFrame ??
        this._animation.clip[this._clip.length - 1].frame,
      this._clip
    );

    // get the first frame number
    this._firstFrame =
      this._animation.startFrame ?? this._animation.clip[firstIndex].frame;

    // get the last frame number
    this._lastFrame =
      this._animation.endFrame ?? this._animation.clip[lastIndex].frame;

    // set the first index
    this._frameIndex = this._animation.AnimateBackwards
      ? lastIndex
      : firstIndex;

    // get the first frame
    this._currentFrame = this._animation.clip[this._frameIndex];

    // set the animation timer to the start time of the animation
    this._animationTime = this._currentFrame.frame / this._frameRate;

    // handle the events for the first frame
    this.handleEvent(this._currentFrame);
  }

  findClosetFrame(frame: number, clip: IAnimationFrame[]): number {
    let startIndex = 0;
    let endIndex = clip.length - 1;

    let firstFrame = clip[startIndex].frame;
    let lastFrame = clip[endIndex].frame;

    // check frame bounds
    if (frame <= firstFrame) {
      return startIndex;
    } else if (frame >= lastFrame) {
      return endIndex;
    }

    while (true) {
      // if the current is the frame we are looking for
      // or the startIndex is one less then endIndex
      // then we are done.
      if (frame == firstFrame || startIndex >= endIndex - 1) {
        return startIndex;
      }

      const midIndex = Math.floor((startIndex + endIndex) / 2.0);
      const midFrame = clip[midIndex].frame;
      if (frame > midFrame) {
        startIndex = midIndex;
      } else if (frame < midFrame) {
        endIndex = midIndex;
      } else {
        // found it in the middle
        return midIndex;
      }
    }
  }

  cancel() {}

  handleEvent(frame: IAnimationFrame) {
    // loop over all the events for this frame
    // and perform the action
    frame.events.forEach((event) => {
      switch (event.eventType) {
        case AnimationEvent.CallbackEvent:
          if (this._animation.onCallbackEvent) {
            this._animation.onCallbackEvent(this);
          }
          break;
        case AnimationEvent.SpriteChange:
          this._spriteController.setSprite(event.value);
          break;
        case AnimationEvent.Flip:
          this._spriteController.flip(event.value);
          break;
        case AnimationEvent.Rotate:
          this._spriteController.rotate(event.value);
          break;
      }
    });
  }

  update(dt: number) {
    this._currentFrame = this._animation.clip[this._frameIndex];
    const nextFrame = this._animation.clip[this._frameIndex + 1];

    // if we have a next frame and its not past the
    // last frame of this animation
    if (nextFrame && nextFrame.frame <= this._lastFrame) {
      const nextFrameTime = nextFrame.frame / this._frameRate;

      // did we pass the time of the next frame.
      // if so fire the events
      if (this._animationTime >= nextFrameTime) {
        // increment the frame index
        this._frameIndex++;
        // set the new frame
        this._currentFrame = this._animation.clip[this._frameIndex];
        // raise the events for the next frame
        this.handleEvent(this._currentFrame);
      }
    } else {
      // Flag this as done.
      if (!this._isDone) {
        this._isDone = true;
        if (this._animation.OnDone) {
          this._animation.OnDone(this);
        }
      }
    }

    // update the animation timer
    this._animationTime += dt;
  }
}
