import { Color, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import { World } from '../ecs/World';
import { ThreeRenderSystem } from '../systems/ThreeRenderSystem';
import type { GameScene } from './GameScene';

export class BattleScene implements GameScene {
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
  private readonly world = new World();

  constructor(renderer: WebGLRenderer) {
    this.scene.background = new Color(0x29151b);
    this.camera.position.set(8, 10, 8);
    this.camera.lookAt(0, 0, 0);
    this.world.addSystem(new ThreeRenderSystem(renderer, this.scene, this.camera));
  }

  update(deltaSeconds: number): void {
    this.world.update(deltaSeconds);
  }

  resize(width: number, height: number): void {
    const viewHeight = 10;
    const viewWidth = viewHeight * (width / Math.max(height, 1));
    this.camera.left = -viewWidth / 2;
    this.camera.right = viewWidth / 2;
    this.camera.top = viewHeight / 2;
    this.camera.bottom = -viewHeight / 2;
    this.camera.updateProjectionMatrix();
  }
}
