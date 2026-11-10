import {
  AmbientLight,
  Color,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { MovementInput } from '../components/MovementInput';
import { Player } from '../components/Player';
import { Renderable } from '../components/Renderable';
import { Transform } from '../components/Transform';
import { World } from '../ecs/World';
import { KeyboardInputSystem } from '../systems/KeyboardInputSystem';
import { PlayerMovementSystem } from '../systems/PlayerMovementSystem';
import { RenderSyncSystem } from '../systems/RenderSyncSystem';
import { ThreeRenderSystem } from '../systems/ThreeRenderSystem';
import type { GameScene } from './GameScene';

export class MainWorldScene implements GameScene {
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
  private readonly world = new World();

  constructor(renderer: WebGLRenderer) {
    this.scene.background = new Color(0x101826);
    this.camera.position.set(8, 10, 8);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrixWorld();

    this.scene.add(new AmbientLight(0xffffff, 1.6));
    const sun = new DirectionalLight(0xffffff, 2.5);
    sun.position.set(4, 10, 2);
    this.scene.add(sun);

    const ground = new Mesh(
      new PlaneGeometry(30, 30),
      new MeshStandardMaterial({ color: 0x16263a, roughness: 0.9 }),
    );
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);
    this.scene.add(new GridHelper(30, 30, 0x365270, 0x243a51));

    const playerMesh = new Mesh(
      new PlaneGeometry(1, 1),
      new MeshStandardMaterial({ color: 0xffc857, side: DoubleSide }),
    );
    playerMesh.rotation.x = -Math.PI / 2;
    this.scene.add(playerMesh);

    const player = this.world.createEntity();
    this.world.addComponent(player, new Transform(new Vector3(0, 0.03, 0)));
    this.world.addComponent(player, new Player(5));
    this.world.addComponent(player, new MovementInput());
    this.world.addComponent(player, new Renderable(playerMesh));
    this.world.addSystem(new KeyboardInputSystem());
    this.world.addSystem(new PlayerMovementSystem(this.camera));
    this.world.addSystem(new RenderSyncSystem());
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
