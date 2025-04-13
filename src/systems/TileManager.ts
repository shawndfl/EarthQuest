import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { ILevelData } from '../environment/ILevelData';
import { ILevelData2 } from '../environment/ILevelData2';
import { GlBuffer, IQuadModel } from '../graphics/GlBuffer';
import { QuadHelper, SpriteMesh } from '../graphics/QuadHelper';
import { SpritBaseController } from '../graphics/SpriteBaseController';

import { Texture } from '../graphics/Texture';
import { clamp } from '../math/constants';
import { Curve, CurveType } from '../math/Curve';
import vec2 from '../math/vec2';

import { TileComponent2 } from '../tileComponents/TileComponent2';
import { TileComponentFactory } from '../tileComponents/TileComponentFactory';

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

export enum TileType {
  Layer1,
  Sprites,
}

/**
 * Manages 8x8
 */
export class TileManager extends Component {
  tiles: number[][][];

  /** Used to render all the tiles */
  protected _quadHelper: QuadHelper;
  protected _spritMeshes: SpriteMesh[];
  //protected _tileComponents: { [string]: TileComponent2 };
  protected _tileComponentFactory: TileComponentFactory;

  //private curve: Curve;

  /** model data for the level */
  protected _levelData: ILevelData;

  constructor(eng: Engine) {
    super(eng);
    this._quadHelper = new QuadHelper(this.eng);
    this._spritMeshes = [];
  }

  initialize(): void {
    // create the gl buffers for this sprite
    this._tileComponentFactory = new TileComponentFactory(this.eng);
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
   * Some tile components can handle input like the player
   * @param state
   */
  handleUserAction(state: InputState): boolean {
    return false;
  }

  /**
   * Loads a new level
   * url http://localhost:8080/?level=assets%2Flevels%2FtileLevel.json
   * @param level
   */
  async loadLevel(level: ILevelData): Promise<void> {
    const levelData = level as any as ILevelData2;
    this.dispose();

    // load all the textures
    const textureKeys = Object.keys(levelData.textures);
    const texturePromises = textureKeys.map((key) => this.eng.assetManager.getTexture(levelData.textures[key]));
    const textures = await Promise.all(texturePromises);
    const textureMap: Map<string, Texture> = new Map();
    textures.forEach((t, i) => textureMap.set(textureKeys[i], t));

    // load the correct texture and tiles based on the type
    this._spritMeshes = this._quadHelper.createQuads(
      levelData.tiles,
      levelData.sprites,
      textureMap,
      levelData.tileScale
    );
    this._spritMeshes.forEach((s) => {
      s.graphicsBuffer.createBuffer();
      s.graphicsBuffer.setBuffers(s.quads, false);
    });
    //this._tileComponents = this._tileComponentFactory.createComponents(levelData.spriteMeta);
  }

  dispose(): void {
    this._spritMeshes.forEach((s) => {
      s.graphicsBuffer?.dispose();
      s.texture.dispose();
    });
  }

  update(dt: number): void {
    // update the buffer
    this._spritMeshes.forEach((mesh) => {
      mesh.graphicsBuffer.enable();
      this.eng.spritePerspectiveShader.setSpriteSheet(mesh.texture);
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

      const vertexCount = mesh.graphicsBuffer.indexCount;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;
      this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
    });
    //this.curve.update(dt);
  }
}
