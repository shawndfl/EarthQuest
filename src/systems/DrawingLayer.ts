import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import { Curve } from '../math/Curve';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';

export class DrawingLayer extends Component {
  private _texture: Texture;
  private _buffer: GlBuffer;
  private _shader: SpritePerspectiveShader;
  private _quads: Quad[]; // should be 32 X 29 For a screen of 128/225

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
    this._quads = [];
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'scene');
  }

  async loadLevel(): Promise<void> {
    const tileSize = 8;
    const level = this.eng.levelData;

    // load all the textures
    this._texture = await level.waitForTextures();

    // setup the shader
    this._shader.setSpriteSheet(this._texture);

    const map = level.data.map;
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

        const tileData = level.tiles.get(tileId);

        if (!tileData) {
          console.error('Missing sprite data for ' + tileId);
          return;
        }
        if (tileData.data.type != 'null') {
          this.placeSingleQuad(loc, tileData);
        }
      }
    }
    this._refreshGeometry = true;
  }

  requestRefresh(): void {
    this._refreshGeometry = true;
  }

  protected refreshGeometry(): void {
    if (this._refreshGeometry) {
      // set the openGL buffers
      const geo = QuadGeometry.createQuad(this._quads);
      this._buffer.setBuffers(geo);

      this._refreshGeometry = false;
    }
  }

  /**
   * Create a line of quads
   * @param loc
   */
  private placeSingleQuad(loc: vec2, tileData: RuntimeTileData): void {
    const x = loc.x;
    const y = loc.y;
    const texture = this._texture;
    this.placeQuad({
      tileData,
      posX: x,
      posY: y,
      posZ: 0,
      alpha: 1,
      hue: 0,
      texture,
      sourcePixelX: tileData.sourcePosition.x,
      sourcePixelY: tileData.sourcePosition.y,
      sourcePixelWidth: tileData.sourceSize.x,
      sourcePixelHeight: tileData.sourceSize.y,
    });
  }

  /**
   * This will place and register the quad with TileManager
   * @param options
   * @returns
   */
  private placeQuad(options: {
    tileData: RuntimeTileData;
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
    const {
      tileData,
      posX,
      posY,
      posZ,
      sourcePixelX,
      sourcePixelY,
      sourcePixelWidth,
      sourcePixelHeight,
      hue,
      alpha,
      texture,
    } = options;

    const transform = new mat4();
    transform.setIdentity();
    transform.translate(new vec3(posX + (tileData.tilePosition.x ?? 0), posY + (tileData.tilePosition.y ?? 0), posZ));
    transform.scale(new vec3(tileData.tileSize.x ?? sourcePixelWidth, tileData.tileSize.y ?? sourcePixelHeight, 1));

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
      // offset quad so that the bottom left is the anchor point instead of the center
      offset: new vec2(width / 2, height / 2),
      transform,
      uvTransform,
      mirrorX: options.tileData.data.flipX,
      mirrorY: options.tileData.data.flipY,
      alpha,
      hueAngle: hue,
    };

    // register the controller so that we can do stuff with this quad
    this.eng.tileManager.registerQuad(options.tileData, quad, texture, this._buffer, this);

    // this class will render the quads so add it to the list
    this._quads.push(quad);
    return quad;
  }

  update(dt: number): void {
    this.refreshGeometry();

    this._shader.enable();

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
