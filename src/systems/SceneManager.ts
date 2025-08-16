import { Component } from '../core/Component';
import { HomeTownScene } from '../scenes/HomeTownScene';
import { Scene } from '../scenes/Scene';

export class SceneManager extends Component {
  activeScene: Scene;

  async initialize(): Promise<void> {
    this.activeScene = new HomeTownScene(this.eng);
  }

  async loadLevel(): Promise<void> {
    this.activeScene.loadLevel();
  }

  resize(width: number, height: number): void {
    this.activeScene.resize(width, height);
  }

  update(dt: number): void {
    this.activeScene.update(dt);
  }
}
