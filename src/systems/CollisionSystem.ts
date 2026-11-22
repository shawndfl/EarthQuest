import { Collision } from '../components/Collision';
import { Transform } from '../components/Transform';
import type { System, World } from '../ecs/World';
import { TileLayoutSystem, tileSize } from './TileLayoutSystem';

export class CollisionSystem implements System {
  constructor(private readonly layout: TileLayoutSystem) { }

  update(world: World): void {
    for (const [, { position }, body] of world.query(Transform, Collision)) {
      for (const axis of ['x', 'z'] as const) {
        const delta = body.displacement[axis];

        // if there is no displacement
        if (!delta) {
          continue;
        }
        const sign = Math.sign(delta);
        const edge = position[axis] + sign * body.halfWidth;
        const cross = position[axis === 'x' ? 'z' : 'x'];
        const cell = (coordinate: number) => Math.floor(coordinate / tileSize + 0.5);
        let travel = delta;
        // Sweep the leading edge through every crossed row or column.
        for (let i = cell(edge + sign * 1e-9); sign * (i - cell(edge + delta)) <= 0; i += sign) {
          let hit = false;
          for (let j = cell(cross - body.halfWidth + 1e-9); j <= cell(cross + body.halfWidth - 1e-9); j++) {
            if (axis === 'x' ? this.layout.blocked(i, j) : this.layout.blocked(j, i)) hit = true;
          }
          if (hit) {
            travel = sign * Math.max(0, sign * ((i - sign * 0.5) * tileSize - edge));
            break;
          }
        }
        position[axis] += travel;
      }
      body.displacement.set(0, 0, 0);
    }
  }
}
