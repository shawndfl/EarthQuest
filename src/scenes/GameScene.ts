export interface GameScene {
  update(deltaSeconds: number): void;
  resize(width: number, height: number): void;
}
