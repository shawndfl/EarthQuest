import { CollisionTile } from './CollisionTile';

export class SolidTile extends CollisionTile {
  async initialize(): Promise<void> {
    console.debug('creating a solid tile');
    this.updateCollision();
  }

  update(dt: number): void {}
}
