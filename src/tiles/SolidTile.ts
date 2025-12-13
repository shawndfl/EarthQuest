import { CollisionTile } from './CollisionTile';

export class SolidTile extends CollisionTile {
  async initialize(): Promise<void> {
    super.initialize();
    console.debug('creating a solid tile');
    this.updateCollision();
  }

  update(dt: number): void {}
}
