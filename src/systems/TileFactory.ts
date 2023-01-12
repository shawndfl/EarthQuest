import { Component } from '../components/Component';
import { EmptyTile } from '../components/EmptyTile';
import { SlopTileComponent } from '../components/SlopTileComponent';
import { TileComponent } from '../components/TileComponent';
import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';

export class TileFactory extends Component {
  constructor(eng: Engine, protected spriteBatch: SpritBatchController) {
    super(eng);
  }

  /**
   * Create an ID for the tile from the initial
   * @param i
   * @param j
   * @param k
   * @returns
   */
  static createStaticID(i: number, j: number, k: number) {
    return 'static.tile.' + i + '.' + j + '.' + k;
  }

  /**
   * Create static tiles
   * @param type
   * @param i
   * @param j
   * @param k
   * @returns
   */
  createStaticTile(
    type: string,
    i: number,
    j: number,
    k: number
  ): TileComponent {
    if (type.includes('slop')) {
      return new SlopTileComponent(
        this.eng,
        this.spriteBatch,
        TileFactory.createStaticID(i, j, k)
      );
    } else {
      return new EmptyTile(
        this.eng,
        this.spriteBatch,
        TileFactory.createStaticID(i, j, k)
      );
    }
  }
}
