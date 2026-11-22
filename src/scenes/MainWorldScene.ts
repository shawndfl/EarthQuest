import { Collision } from '../components/Collision';
import { CollisionSystem } from '../systems/CollisionSystem';
import { TileLayoutSystem, tileSize, isometricOrder } from '../systems/TileLayoutSystem';
import {
  Color,
  OrthographicCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';
import { MovementInput } from '../components/MovementInput';
import { Player } from '../components/Player';
import { Renderable } from '../components/Renderable';
import { SpriteComponent } from '../components/SpriteComponent';
import { Transform } from '../components/Transform';
import { World } from '../ecs/World';
import { KeyboardInputSystem } from '../systems/KeyboardInputSystem';
import { CameraFollowSystem } from '../systems/CameraFollowSystem';
import { PlayerMovementSystem } from '../systems/PlayerMovementSystem';
import { RenderSyncSystem } from '../systems/RenderSyncSystem';
import { SpriteAnimationSystem } from '../systems/SpriteAnimationSystem';
import { ThreeRenderSystem } from '../systems/ThreeRenderSystem';
import type { GameScene } from './GameScene';

export class MainWorldScene implements GameScene {
  private readonly scene = new Scene();
  private readonly camera = new OrthographicCamera(-8, 8, 5, -5, 0.1, 100);
  private readonly world = new World();

  constructor(renderer: WebGLRenderer) {
    this.scene.background = new Color(0x101826);
    this.camera.position.set(8, 8 * Math.sqrt(2 / 3), 8);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrixWorld();


    const layout = new TileLayoutSystem([
      '333333333333333333',
      '311131111111111113',
      '312234122111111113',
      '311111111111111113333333333333333',
      '311211111111111111111111111111113',
      '311111131111111111111111111111113',
      '311111131111111111111111111111113',
      '31122111111111111111111111111111333333333',
      '31112111111111111111111111111111111111113',
      '333333313333333313333333333333333333333113',
      '333332111333333311111111111111111111111313',
      '333333313333333313333333333333333333333313',
      '311111111111111111111111111111111111111113',
      '333333313333333313333333333333333333333313',
      '311111111111111111111111111111111111111113',
      '333333313333333313333333333333333333333313',
      '311111111111111111111111111111111111111113',
      '333333313333333313333333333333333333333313',
      '311111111111111111111111111111111111111113',
      '333333333311111111111333333333333333333333',
      '0000000003333333333333',
    ]);

    void layout.load(this.scene).catch(console.error);
    const player = this.world.createEntity();
    const playerSprite = this.world.addComponent(
      player,
      new SpriteComponent('sprites/Sprite.json', {
        animation: 'Forward',
        pixelsPerUnit: 16,
      }),
    );
    this.scene.add(playerSprite.object);
    this.world.addComponent(player, new Transform(new Vector3(5 * tileSize, 0.03, 4 * tileSize)));
    this.world.addComponent(player, new Collision(0.22));
    this.world.addComponent(player, new Player(5));
    this.world.addComponent(player, new MovementInput());
    this.world.addComponent(player, new Renderable(playerSprite.object));
    this.world.addSystem(new KeyboardInputSystem());
    this.world.addSystem(new PlayerMovementSystem(this.camera));
    this.world.addSystem(new CollisionSystem(layout));
    this.world.addSystem(new CameraFollowSystem(this.camera, player));
    this.world.addSystem(new SpriteAnimationSystem());
    this.world.addSystem(new RenderSyncSystem());
    this.world.addSystem({
      update() {
        const sprite = playerSprite.sprite;
        if (!sprite) return;
        const { x, z } = playerSprite.object.position;
        sprite.renderOrder = isometricOrder(x, z);
        sprite.material.depthTest = false;
        sprite.material.depthWrite = false;
      },
    });
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
