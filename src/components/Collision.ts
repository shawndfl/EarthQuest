import { Vector3 } from 'three';

/** Square footprint centered on the entity's feet in the XZ plane. */
export class Collision {
  readonly displacement = new Vector3();

  constructor(readonly halfWidth: number) {}
}
