import { AnimationController } from '../src/core/AnimationController';
import { AnimationEvent, IAnimationData } from '../src/core/IAnimationData';
import { SpriteFlip } from '../src/core/Sprite';
import { ISpriteController } from '../src/environment/ISprintController';

class MockSpriteController implements ISpriteController {
  flipValue: SpriteFlip;
  rotateValue: number;
  spriteId: string;

  constructor(private onSpriteChange: (id: string) => void) {}

  flip(flipDirection: SpriteFlip): void {
    this.flipValue = flipDirection;
  }
  rotate(angle: number): void {
    this.rotateValue = angle;
  }

  setSprite(id: string): void {
    this.spriteId = id;
    if (this.onSpriteChange) {
      this.onSpriteChange(id);
    }
  }
}
/*
test('Find animation', () => {
  const animationData: IAnimationData = {
    clip: [],
    startFrame: 990,
  };

  const frameCount = 10;
  // create some test frames
  for (let i = 0; i < frameCount; i++) {
    animationData.clip.push({
      frame: i * 10,
      events: [
        {
          eventType: AnimationEvent.CallbackEvent,
          value: 'testing ' + i,
        },
      ],
    });
  }

  animationData.onCallbackEvent = (ctrl: AnimationController) => {
    console.debug(
      'callback event: current frame ' +
        ctrl.currentFrame.frame +
        ' animation time ' +
        ctrl.animationTime
    );
  };
  //console.debug('animationClip ', animationData.clip);

  const animation = new AnimationController(new MockSpriteController());
  animation.start(animationData);
  expect(animation.clip.length).toBe(frameCount);
  //animation.clip.forEach((val) => {
  //  console.debug(val.frame);
  //});

  expect(animation.frameRate).toBe(30);
});
*/

/**
 * Test animation clip event raising and running through 10 frames
 */
test('Animation clip', () => {
  const frameCount = 10;

  const animationData: IAnimationData = {
    clip: [],
    startFrame: 0,
  };

  for (let i = 0; i < frameCount; i++) {
    animationData.clip.push({
      frame: Math.floor(i * 10),
      events: [
        {
          eventType: AnimationEvent.CallbackEvent,
          value: 'testing ' + i,
        },
      ],
    });
  }
  let isDone = false;
  let isStart = false;
  let callbackFn = jest.fn((ctl) => {});

  const animation = new AnimationController(new MockSpriteController(() => {}));
  animationData.onCallbackEvent = callbackFn;

  animationData.onStart = (ctrl) => {
    isStart = true;
  };
  animationData.OnDone = (ctrl) => {
    isDone = true;
  };

  animation.start(animationData);

  for (let i = 0; i < 90; i++) {
    animation.update(30 / 60);
  }

  expect(isStart).toBe(true);
  expect(callbackFn).toBeCalledTimes(10);
  expect(isDone).toBe(true);
});

test('Animation sprite change event', () => {
  const frameCount = 10;

  const animationData: IAnimationData = {
    clip: [],
    startFrame: 0,
  };

  for (let i = 0; i < frameCount; i++) {
    animationData.clip.push({
      frame: Math.floor(i * 10),
      events: [
        {
          eventType: AnimationEvent.SpriteChange,
          value: 'sprite.' + i,
        },
        {
          eventType: AnimationEvent.Rotate,
          value: 90,
        },
        {
          eventType: AnimationEvent.Flip,
          value: SpriteFlip.XFlip,
        },
      ],
    });
  }

  let setSprite = jest.fn((id: string) => {
    //NOP
  });

  const spriteController = new MockSpriteController(setSprite);
  const animation = new AnimationController(spriteController);

  animation.start(animationData);

  for (let i = 0; i < 90; i++) {
    animation.update(30 / 60);
  }

  expect(setSprite).toBeCalledTimes(10);

  expect(spriteController.flipValue).toBe(SpriteFlip.XFlip);
  expect(spriteController.rotateValue).toBe(90);
  expect(spriteController.spriteId).toBe('sprite.9');
});
