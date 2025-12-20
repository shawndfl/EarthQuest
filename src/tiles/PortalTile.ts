import { CollisionTile } from './CollisionTile';

/**
 * This will load a new scene based on who hit this tile
 */
export class PortalTile extends CollisionTile {
  async initialize(): Promise<void> {
    super.initialize();
    this.updateCollision();
  }

  onCollision(source: CollisionTile): void {
    console.debug('hit by ' + source.name);
  }

  update(dt: number): void {}
}
