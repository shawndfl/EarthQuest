import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { ILevelData } from '../environment/ILevelData';
import { ILevelData2 } from '../environment/ILevelData2';
import { GlBuffer, IQuadModel } from '../graphics/GlBuffer';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';

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
  protected _quads: IQuadModel[];

  // Testing
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

    this._tileTexture = await this.eng.assetManager.getTexture(levelData.tileSheet);
    this._graphicsBuffer.createBuffer();

    this._quads = [];
    this._quads.push({
      min: new vec3(10, 10, 0),
      max: new vec3(790, 590, 0),
      minTex: new vec2(0, 1),
      maxTex: new vec2(1, 0),
    });

    this._graphicsBuffer.setBuffers(this._quads, false);
  }

  private dumpOnce = true;
  update(dt: number): void {
    // update the buffer

    this._graphicsBuffer.enable();
    this.eng.spritePerspectiveShader.setSpriteSheet(this._tileTexture);
    this.eng.spritePerspectiveShader.enable();

    const view = this.eng.viewManager;

    let projection = view.projection;
    projection = view.calculateProjection(new vec2(0, 0), 1);
    //if (this._viewOffset && this._viewScale) {
    //  projection = view.calculateProjection(this._viewOffset, this._viewScale);
    // }

    if (this.dumpOnce) {
      console.debug('new buffer', this._graphicsBuffer);
      console.debug('old buffer', this._spriteController.buffer);
      this.dumpOnce = false;
    }

    // set the project
    this.eng.spritePerspectiveShader.setProj(projection);

    const vertexCount = this._graphicsBuffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);

    // testing
    this._spriteController.update(dt);
  }
}
