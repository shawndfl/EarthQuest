import { AnimationController } from '../src/core/AnimationController';
import { AnimationEvent, IAnimationData } from '../src/core/IAnimationData';
import { SpriteFlip } from '../src/core/Sprite';
import { ISpriteController } from '../src/environment/ISprintController';

class MockSpriteController implements ISpriteController {
  constructor(private onSpriteChange: (id: string) => void) {}

  setSprite(id: string, flip: SpriteFlip): void {
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
  let callbackCount = 0;

  const animation = new AnimationController(new MockSpriteController(() => {}));
  animationData.onCallbackEvent = (ctrl) => {
    callbackCount++;

    console.debug(
      'callback event: current frame ' +
        ctrl.currentFrame.frame +
        ' animation time ' +
        ctrl.animationTime
    );
  };

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
  expect(callbackCount).toBe(10);
  expect(isDone).toBe(true);
});

test('Animation clip2', () => {
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
      ],
    });
  }

  let setSprite = jest.fn((id: string) => {
    //NOP
  });

  const animation = new AnimationController(
    new MockSpriteController(setSprite)
  );

  animation.start(animationData);

  for (let i = 0; i < 90; i++) {
    animation.update(30 / 60);
  }

  expect(setSprite).toBeCalledTimes(10);
});
