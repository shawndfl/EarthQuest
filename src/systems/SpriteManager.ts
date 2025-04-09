import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { ILevelData } from '../environment/ILevelData';
import { ILevelData2 } from '../environment/ILevelData2';
import { GlBuffer, IQuadModel } from '../graphics/GlBuffer';
import { QuadHelper } from '../graphics/QuadHelper';
import { SpritBaseController } from '../graphics/SpriteBaseController';

import { Texture } from '../graphics/Texture';
import { clamp } from '../math/constants';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';

/**
 * Manages 8x8
 */
export class SpriteManager extends Component {
  /** Used to render all the sprites */
  protected _spriteTexture: Texture;
  protected _graphicsBuffer: GlBuffer;
  protected _quadHelper: QuadHelper;
  protected _quads: IQuadModel[];

  //private curve: Curve;

  /** model data for the level */
  protected _levelData: ILevelData;

  constructor(eng: Engine) {
    super(eng);
    this._quadHelper = new QuadHelper(this.eng);
    this._graphicsBuffer = new GlBuffer(this.gl);
  }

  initialize(): void {
    if (this._graphicsBuffer) {
      this._graphicsBuffer.dispose();
    }

    // create the gl buffers for this sprite
    this._graphicsBuffer = new GlBuffer(this.gl);

    /*
    this.curve = new Curve();
    this.curve.points([
      { p: -500, t: 0 },
      { p: 2000, t: 90000 },
    ]);
    this.curve.pingPong(true);
    this.curve.curve(CurveType.linear);
    this.curve.repeat(-1);
    this.curve.start();
    */
  }

  /**
   * Loads a new level
   * url http://localhost:8080/?level=assets%2Flevels%2FtileLevel.json
   * @param level
   */
  async loadLevel(level: ILevelData): Promise<void> {
    const levelData = level as any as ILevelData2;

    this._spriteTexture = await this.eng.assetManager.getTexture(levelData.spriteSheet);
    this._graphicsBuffer.createBuffer();

    this._quads = this._quadHelper.createQuads(levelData.sprites, this._spriteTexture, levelData.tileScale);

    this._graphicsBuffer.setBuffers(this._quads, false);
  }

  handleUserAction(state: InputState): boolean {
    return false;
  }

  update(dt: number): void {
    // update the buffer

    this._graphicsBuffer.enable();
    this.eng.spritePerspectiveShader.setSpriteSheet(this._spriteTexture);
    this.eng.spritePerspectiveShader.enable();

    const view = this.eng.viewManager;

    let projection = view.projection;
    //projection = view.calculateProjection(new vec2(this.curve.getValue(), 0), 0.7);
    projection = view.calculateProjection(new vec2(0, 0), 1);
    //if (this._viewOffset && this._viewScale) {
    //  projection = view.calculateProjection(this._viewOffset, this._viewScale);
    // }

    // set the project
    this.eng.spritePerspectiveShader.setProj(projection);

    const vertexCount = this._graphicsBuffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);

    //this.curve.update(dt);
  }
}
