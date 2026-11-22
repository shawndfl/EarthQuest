import { Collision } from '../components/Collision';
import { Camera, Vector3 } from 'three';
import type { System, World } from '../ecs/World';
import { MovementInput } from '../components/MovementInput';
import { Player } from '../components/Player';
import { SpriteComponent } from '../components/SpriteComponent';
import { Transform } from '../components/Transform';

export class PlayerMovementSystem implements System {
  private readonly cameraRight = new Vector3();
  private readonly cameraForward = new Vector3();
  private readonly movement = new Vector3();

  constructor(private readonly camera: Camera) { }

  update(world: World, deltaSeconds: number): void {
    this.camera.getWorldDirection(this.cameraForward);
    this.cameraForward.y = 0;
    this.cameraForward.normalize();
    this.cameraRight.crossVectors(this.cameraForward, this.camera.up).normalize();

    for (const [entity, transform, player, input] of world.query(
      Transform,
      Player,
      MovementInput,
    )) {
      const sprite = world.getComponent(entity, SpriteComponent);
      if (sprite) this.updateAnimation(sprite, input);

      this.movement
        .copy(this.cameraRight)
        .multiplyScalar(input.horizontal)
        .addScaledVector(this.cameraForward, input.vertical);
      if (this.movement.lengthSq() > 0) {
        this.movement.normalize();
        const body = world.getComponent(entity, Collision);
        if (body) body.displacement.copy(this.movement).multiplyScalar(player.speed * deltaSeconds);
        else transform.position.addScaledVector(this.movement, player.speed * deltaSeconds);
      }
    }
  }

  private updateAnimation(sprite: SpriteComponent, input: MovementInput): void {
    if (input.horizontal === 0 && input.vertical === 0) {
      sprite.pause();
      sprite.setFrame(1);
      return;
    }

    // The sheet contains the left-facing half of the eight movement directions.
    // Mirror those animations for movement to the right.
    sprite.setFlipHorizontal(input.horizontal > 0);

    if (input.vertical > 0) {
      //sprite.setFlipVertical(input.horizontal < 0)      
      sprite.play(input.horizontal === 0 ? 'Back' : 'BackLeft', !sprite.isPlaying());
    } else if (input.vertical < 0) {
      sprite.play(input.horizontal === 0 ? 'Forward' : 'ForwardLeft', !sprite.isPlaying());
    } else {
      sprite.play('Left');
    }
  }
}
