import { SpriteComponent } from '../components/SpriteComponent';
import type { System, World } from '../ecs/World';

export class SpriteAnimationSystem implements System {
  update(world: World, deltaSeconds: number): void {
    for (const [, sprite] of world.query(SpriteComponent)) {
      sprite.update(deltaSeconds);
    }
  }
}
