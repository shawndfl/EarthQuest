import { Camera, Vector3 } from 'three';
import type { System, World } from '../ecs/World';
import { MovementInput } from '../components/MovementInput';
import { Player } from '../components/Player';
import { Transform } from '../components/Transform';

export class PlayerMovementSystem implements System {
  private readonly cameraRight = new Vector3();
  private readonly cameraForward = new Vector3();
  private readonly movement = new Vector3();

  constructor(private readonly camera: Camera) {}

  update(world: World, deltaSeconds: number): void {
    this.camera.getWorldDirection(this.cameraForward);
    this.cameraForward.y = 0;
    this.cameraForward.normalize();
    this.cameraRight.crossVectors(this.cameraForward, this.camera.up).normalize();

    for (const [, transform, player, input] of world.query(Transform, Player, MovementInput)) {
      this.movement
        .copy(this.cameraRight)
        .multiplyScalar(input.horizontal)
        .addScaledVector(this.cameraForward, input.vertical);
      if (this.movement.lengthSq() > 0) {
        this.movement.normalize();
        transform.position.addScaledVector(this.movement, player.speed * deltaSeconds);
      }
    }
  }
}
