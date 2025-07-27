import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { ILevelData, RuntimeTileData, TileData } from '../data/ILevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import { Curve, CurveType } from '../math/Curve';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { UserAction } from './InputManager';

export class DrawingLayer extends Component {
  private _textures: Texture[];
  private _buffer: GlBuffer;
  private _shader: SpritePerspectiveShader;
  private _quads: Quad[]; // should be 32 X 29 For a screen of 128/225
  private _backgroundTileMin: vec2;
  private _backgroundTileMax: vec2;
  private _backgroundTileReset: boolean;

  private _refreshGeometry: boolean;

  private _curve: Curve;

  constructor(eng: Engine, private _layerIndex: number) {
    super(eng);

    this.eng.notificationManager.subscribe('view_change', () => {
      //todo update the drawing layer
    });
  }

  /**
   * Create the tiles
   */
  async initialize(): Promise<void> {
    this._textures = [];
    this._quads = [];
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'scene');
    this._backgroundTileMin = new vec2(-this.eng.width / 2, -this.eng.height / 2);
    this._backgroundTileMax = new vec2(this.eng.width * 1.5, this.eng.height * 1.5);
  }

  async loadLevel(): Promise<void> {
    const tileSize = 8;
    const level: ILevelData = this.eng.gameManager.levelData;
    const promise = [];
    console.debug('TileManager loading level...');

    // load all the textures
    for (let texturePath of level.textures) {
      const texture = this.eng.assetManager.getTexture(texturePath);
      promise.push(texture);
    }

    await Promise.all(promise).then((textures) => this._textures.push(...textures));

    // setup the shader
    this._shader.setSpriteSheet(this._textures[0]);

    //this.updateTiles();

    const map = level.map;
    const loc = new vec2(); // location of the tile in world space
    const layer = this._layerIndex;

    // loop over all the tiles in this map for this layer
    for (let row = 0; row < map[layer].length; row++) {
      // the encoded two character id for the tile data
      const rowIds = map[layer][row];

      for (let i = 0; i < rowIds.length; i += 2) {
        const tileId = rowIds.substring(i, i + 2);

        loc.x = (i / 2) * this.eng.pixelScale * tileSize;
        loc.y = -row * this.eng.pixelScale * tileSize;

        console.debug(' tile at (' + layer + ', ' + row + ', ' + i + ') = ' + tileId);

        const tileData = level.tiles[tileId];

        if (!tileData) {
          console.error('Missing sprite data for ' + tileId);
          return;
        }

        this.placeSingleQuad(loc, tileData);
      }
    }
    this._refreshGeometry = true;
  }

  requestRefresh(): void {
    this._refreshGeometry = true;
  }

  protected refreshGeometry(): void {
    // set the openGL buffers
    const geo = QuadGeometry.CreateQuad(this._quads);
    this._buffer.setBuffers(geo);
    this._refreshGeometry = false;
  }

  /**
   * Create a line of quads
   * @param loc
   */
  private placeSingleQuad(loc: vec2, tileData: TileData): void {
    const sourceLocation = this.getLocationFromString(tileData.sourceLocation);

    const x = loc.x;
    const y = loc.y;
    const texture = this.getTextureFromId(tileData.sourceTextureIndex);
    this.placeQuad({
      tileData,
      posX: x,
      posY: y,
      posZ: 0,
      alpha: 1,
      hue: 0,
      texture,
      sourcePixelX: sourceLocation.x,
      sourcePixelY: sourceLocation.y,
      sourcePixelWidth: sourceLocation.z,
      sourcePixelHeight: sourceLocation.w,
    });
  }

  /**
   * Get the texture from an index
   * @param index
   * @returns
   */
  private getTextureFromId(index: number): Texture {
    if (!index) {
      return this._textures[0];
    }
    return this._textures[index];
  }

  /**
   * This will place and register the quad with TileManager
   * @param options
   * @returns
   */
  private placeQuad(options: {
    tileData: TileData;
    posX: number;
    posY: number;
    posZ: number;
    sourcePixelX: number;
    sourcePixelY: number;
    sourcePixelWidth: number;
    sourcePixelHeight: number;
    hue: number;
    alpha: number;
    texture: Texture;
  }): Quad {
    const { posX, posY, posZ, sourcePixelX, sourcePixelY, sourcePixelWidth, sourcePixelHeight, hue, alpha, texture } =
      options;

    const transform = new mat4();
    transform.setIdentity();
    transform.translate(new vec3(posX, posY, posZ));
    transform.scale(new vec3(sourcePixelWidth, sourcePixelHeight, 1));

    const uvTransform = new mat3();
    const scaleX = sourcePixelWidth / texture.width;
    const scaleY = sourcePixelHeight / texture.height;
    const offsetU = sourcePixelX / texture.width;
    const offsetV = sourcePixelY / texture.height;
    uvTransform.setIdentity();
    uvTransform.scale(new vec2(scaleX, scaleY));
    uvTransform.setTranslation(new vec2(offsetU, 1 - scaleY - offsetV));

    // create a quad
    const width = this.eng.pixelScale; // this will match the size of the canvas pixel scale
    const height = this.eng.pixelScale;
    const quad = {
      width,
      height,
      // offset quad so that the bottom right is the anchor point instead of the center
      offset: new vec2(width / 2, height / 2),
      transform,
      uvTransform,
      mirrorX: options.tileData.flipX,
      mirrorY: options.tileData.flipY,
      alpha,
      hueAngle: hue,
    };

    // register the controller so that we can do stuff with this quad
    if (options.tileData.dynamic) {
      this.eng.tileManager.registerQuad(options.tileData, quad, texture, this._buffer, this);
    }

    // this class will render the quads so add it to the list
    this._quads.push(quad);
    return quad;
  }

  /**
   * Parses the location from a string
   * @param location
   * @returns
   */
  private getLocationFromString(location: string): vec4 {
    const components = location.split(',');

    let command;

    const point = new vec4();
    let i = 0;
    try {
      point.x = parseFloat(components[i++]);
      point.y = parseFloat(components[i++]);
      point.z = parseFloat(components[i++]);
      point.w = parseFloat(components[i++]);
    } catch (e) {
      console.error('Cannot parse ' + location + ' expecting [x,y] or [x,y,z,w]');
    }

    return point;
  }

  update(dt: number): void {
    if (this.requestRefresh) {
      this.refreshGeometry();
    }

    this._shader.enable();
    const scale = 1;
    const adjustX = this.eng.width - this.eng.width * scale;
    const adjustY = this.eng.height - this.eng.height * scale;

    //this._curve.update(dt);

    const proj = this.eng.viewManager.projection;

    this._shader.setProj(proj);
    this._buffer.enable();

    const count = this._buffer.indexCount;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;

    this.gl.depthFunc(this.gl.ALWAYS);
    this.gl.drawElements(this.gl.TRIANGLES, count, type, offset);
    this.gl.depthFunc(this.gl.LEQUAL);
  }
}
