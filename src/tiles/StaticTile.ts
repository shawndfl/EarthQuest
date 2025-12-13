import { TileController } from './TileController';

export class StaticTile extends TileController {
  async initialize(): Promise<void> {
    super.initialize();
    //nop
  }
  update(dt: number): void {
    //nop
  }
}
