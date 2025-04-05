import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';
import { ILevelData2 } from '../environment/ILevelData2';
import { GlBuffer } from '../graphics/GlBuffer';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Texture } from '../graphics/Texture';
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
  protected _tileTexture: Texture;
  protected _graphicsBuffer: GlBuffer;

  protected _spriteController: SpritBatchController;

  /** model data for the level */
  protected _levelData: ILevelData;

  constructor(eng: Engine) {
    super(eng);
    this._graphicsBuffer = new GlBuffer(this.gl);

    // testing
    this._spriteController = new SpritBatchController(this.eng);
  }

  initialize(): void {
    if (this._graphicsBuffer) {
      this._graphicsBuffer.dispose();
    }

    // create the gl buffers for this sprite
    this._graphicsBuffer = new GlBuffer(this.gl);

    // testing
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
   * url http://localhost:8080/?level=assets%2Flevels%2FtileLevel.json
   * @param level
   */
  async loadLevel(level: ILevelData): Promise<void> {
    const levelData = level as any as ILevelData2;

    this._tileTexture = await this.eng.assetManager.getTexture(levelData.spriteSheet);
    this._graphicsBuffer.createBuffer();
  }

  update(dt: number): void {
    /*
    if (this._quads.length < this._sprites.size) {
      this._quads = new Array(this._sprites.size);
    }

    let i = 0;
    this._sprites.forEach((sprite) => {
      this._quads[i++] = sprite.quad;
    });

    // update the buffer
    this._graphicsBuffer.setBuffers(this._quads, false, undefined, this._sprites.size);

    this._graphicsBuffer.enable();
    this.eng.spritePerspectiveShader.setSpriteSheet(this._tileTexture);
    this.eng.spritePerspectiveShader.enable();

    const view = this.eng.viewManager;

    let projection = view.projection;
    if (this._viewOffset && this._viewScale) {
      projection = view.calculateProjection(this._viewOffset, this._viewScale);
    }

    // set the project
    this.eng.spritePerspectiveShader.setProj(projection);

    this.render();
  */
  }
}
