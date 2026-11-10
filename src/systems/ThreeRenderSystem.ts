import { Camera, Scene, WebGLRenderer } from 'three';
import type { System } from '../ecs/World';

export class ThreeRenderSystem implements System {
  constructor(
    private readonly renderer: WebGLRenderer,
    private readonly scene: Scene,
    private readonly camera: Camera,
  ) {}

  update(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
