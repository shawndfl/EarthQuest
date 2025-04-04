import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';

/**
 * Tiles are 8x8 images
 */
export interface ITile {
  /**
   *  the id of the sprite data
   */
  id: string;

  /**
   * row in the tilesheet. Times 8 is the pixel offset.
   */
  row: number;
  /**
   * column in the tilesheet. Times 8 is the pixel offset.
   */
  column: number;

  /**
   * Flip the image horizontal
   */
  flipX?: boolean;

  /**
   * Flip vertically
   */
  flipY?: boolean;

  /**
   * How many times to rotate 90 degrees
   */
  rotate90DegreesCW: number;
}

export class TileSheet {
  image: SpritBaseController;
}

/**
 * Manages 8x8
 */
export class TileManager extends Component {
  tiles: number[][][];

  /** Used to render all the tiles */
  protected _spriteController: SpritBatchController;

  /** model data for the level */
  protected _levelData: ILevelData;

  constructor(eng: Engine) {
    super(eng);
    this._spriteController = new SpritBatchController(this.eng);
  }

  initialize(): void {
    const texture = this.eng.assetManager.tile.texture;
    const data = this.eng.assetManager.tile.data;
    this._spriteController.initialize(texture, data);
    this._spriteController.activeSprite('0');
    this._spriteController.setSprite('block');
    this._spriteController.scale(2);
    this._spriteController.setSpritePosition(50, 150);
    this._spriteController.viewOffset(new vec2(0, 0));
    this._spriteController.viewScale(1.0);
  }

  /**
   * Loads a new level
   * @param level
   */
  async loadLevel(level: ILevelData): Promise<void> {}

  update(dt: number): void {
    this._spriteController.update(dt);
  }
}
