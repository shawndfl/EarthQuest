import { AnimationController } from '../src/core/AnimationController';
import { IAnimationData } from '../src/core/IAnimationData';
import { SpriteFlip } from '../src/core/Sprite';
import { ISpriteController } from '../src/environment/ISprintController';

test('Find animation', () => {
  const animationData: IAnimationData = {
    clip: [],
  };

  class MockSpriteController implements ISpriteController {
    setSprite(id: string, flip: SpriteFlip): void {
      // NOP
    }
  }

  // create some test frames
  for (let i = 0; i < 1000; i++) {
    animationData.clip.push({ id: 'frame ' + i, frame: i * 10 });
  }

  const animation = new AnimationController(new MockSpriteController());
  animation.start(animationData);

  expect(animation.frameRate).toBe(30);
});
