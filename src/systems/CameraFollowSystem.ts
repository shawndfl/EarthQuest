import { Camera, Vector3 } from 'three';
import { Transform } from '../components/Transform';
import type { Entity, System, World } from '../ecs/World';

/** Keeps a camera at a fixed offset from an entity and aimed at it. */
export class CameraFollowSystem implements System {
  private readonly offset = new Vector3();

  constructor(
    private readonly camera: Camera,
    private readonly target: Entity,
    initialTarget = new Vector3(),
  ) {
    this.offset.copy(camera.position).sub(initialTarget);
  }

  update(world: World): void {
    const transform = world.getComponent(this.target, Transform);
    if (!transform) return;

    this.camera.position.copy(transform.position).add(this.offset);
    this.camera.lookAt(transform.position);
    this.camera.updateMatrixWorld();
  }
}
