import type { System, World } from '../ecs/World';
import { Renderable } from '../components/Renderable';
import { Transform } from '../components/Transform';

export class RenderSyncSystem implements System {
  update(world: World): void {
    for (const [, transform, renderable] of world.query(Transform, Renderable)) {
      renderable.object.position.copy(transform.position);
    }
  }
}
