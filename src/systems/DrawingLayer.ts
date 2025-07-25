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

export class DrawingLayer extends Component {
  private _textures: Texture[];
  private _buffer: GlBuffer;
  private _shader: SpritePerspectiveShader;
  private _quads: Quad[]; // should be 32 X 29 For a screen of 128/225

  private _curve: Curve;

  constructor(eng: Engine, private _layerIndex: number) {
    super(eng);
  }

  /**
   * Create the tiles
   */
  async initialize(): Promise<void> {
    this._textures = [];
    this._quads = [];
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'scene');
  }

  async loadLevel(level: ILevelData): Promise<void> {
    const promise = [];
    console.debug('TileManager loading level...');

    // load all the textures
    for (let texturePath of level.textures) {
      const texture = this.eng.assetManager.getTexture(texturePath);
      promise.push(texture);
    }

    await Promise.all(promise).then((textures) => this._textures.push(...textures));

    const map = level.map;
    for (let layer = 0; layer < map.length; layer++) {
      for (let row = 0; row < map[layer].length; row++) {
        const rowIds = map[layer][row];
        for (let i = 0; i < rowIds.length; i += 2) {
          const tileId = rowIds.substring(i, i + 2);
          console.debug(' tile at (' + layer + ', ' + row + ', ' + i + ') = ' + tileId);
        }
      }
    }

    const layer = level.layers[this._layerIndex];
    for (let location of Object.keys(layer)) {
      const cmdLoc = this.getLocationFromString(location);
      const loc = cmdLoc.point;
      const cmd = cmdLoc.command;
      const tileId = layer[location];
      const tileData = level.tiles[tileId];
      if (!tileData) {
        console.error('Missing sprite data for ' + tileId);
        return;
      }

      if (cmd == 'line') {
        this.placeQuadsInLine(loc, tileData);
      } else if (cmd == 'fill') {
        this.placeQuadsInFill(loc, tileData);
      } else {
        this.placeSingleQuad(loc, tileData);
      }
    }
    // set the openGL buffers
    const geo = QuadGeometry.CreateQuad(this._quads);
    this._buffer.setBuffers(geo);

    // setup the shader
    this._shader.setSpriteSheet(this._textures[0]);

    // animate view manager
    this._curve = new Curve();
    this._curve.curve(CurveType.linear);
    this._curve.pingPong(true);
    this._curve.repeat(-1);
    this._curve.points([
      { p: 0, t: 0 },
      { p: 400, t: 3000 },
    ]);
    this._curve.start(true, null, (value) => {
      this.eng.viewManager.setTarget(value, 0);
    });
  }

  /**
   * Create a line of quads
   * @param loc
   */
  private placeSingleQuad(loc: vec4, tileData: TileData): void {
    const sourceLocation = this.getLocationFromString(tileData.sourceLocation, true).point;

    const x = loc.x;
    const y = loc.y;
    const texture = this.getTextureFromId(tileData.sourceTextureIndex);
    this.placeQuad({
      tileData,
      posX: x * 2,
      posY: y * 2,
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
   * Create a line of quads
   * @param loc
   * @param spriteData
   */
  private placeQuadsInLine(loc: vec4, tileData: TileData): void {
    const lineStep = 8;
    const p0 = new vec2(loc.x, loc.y);
    const p1 = new vec2(loc.z, loc.w);
    const dist = p0.subtract(p1).length() / lineStep;
    const sourceLocation = this.getLocationFromString(tileData.sourceLocation, true).point;

    for (let t = 0; t < dist; t++) {
      const x = loc.x + Math.sign(loc.z - loc.x) * t * lineStep;
      const y = loc.y + Math.sign(loc.w - loc.y) * t * lineStep;
      this.placeQuad({
        tileData,
        posX: x * 2,
        posY: y * 2,
        posZ: 0,
        alpha: 1,
        hue: 0,
        texture: this.getTextureFromId(tileData.sourceTextureIndex),
        sourcePixelX: sourceLocation.x,
        sourcePixelY: sourceLocation.y,
        sourcePixelWidth: sourceLocation.z,
        sourcePixelHeight: sourceLocation.w,
      });
    }
  }

  /**
   * Create a line of quads
   * @param loc
   * @param spriteData
   */
  private placeQuadsInFill(loc: vec4, tileData: TileData): void {
    const sourceLocation = this.getLocationFromString(tileData.sourceLocation, true).point;

    for (let x = loc.x; x < loc.z; x += sourceLocation.z * 2) {
      for (let y = loc.y; y < loc.w; y += sourceLocation.w * 2) {
        this.placeQuad({
          tileData,
          posX: x,
          posY: y,
          posZ: 0,
          alpha: 1,
          hue: 0,
          texture: this.getTextureFromId(tileData.sourceTextureIndex),
          sourcePixelX: sourceLocation.x,
          sourcePixelY: sourceLocation.y,
          sourcePixelWidth: sourceLocation.z,
          sourcePixelHeight: sourceLocation.w,
        });
      }
    }
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
    const width = 2; // this will double the size of the quad
    const height = 2;
    const quad = {
      width,
      height,
      // offset quad so that the bottom right is the anchor point instead of the center
      offset: new vec2(width / 2, height / 2),
      transform,
      uvTransform,
      mirrorX: false,
      mirrorY: false,
      alpha,
      hueAngle: hue,
    };

    // register the controller so that we can do stuff with this quad
    if (options.tileData.dynamic) {
      this.eng.tileManager.registerQuad(options.tileData, quad, texture, this._buffer);
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
  private getLocationFromString(location: string, skipCommand?: boolean): { command: string; point: vec4 } {
    const components = location.split(',');

    let command;

    const point = new vec4();
    let i = 0;
    if (!skipCommand) {
      i++;
      command = components[0];
    }
    try {
      point.x = parseFloat(components[i++]);
      point.y = parseFloat(components[i++]);
      point.z = parseFloat(components[i++]);
      point.w = parseFloat(components[i++]);
    } catch (e) {
      console.error('Cannot parse ' + location + ' expecting [x,y] or [x,y,z,w]');
    }

    return { point, command };
  }

  update(dt: number): void {
    this._shader.enable();
    const scale = 1;
    const adjustX = this.eng.width - this.eng.width * scale;
    const adjustY = this.eng.height - this.eng.height * scale;

    this._curve.update(dt);

    //const proj = mat4.orthographic(adjustX, this.eng.width * scale, adjustY, this.eng.height * scale, 0, 1);
    const proj = this.eng.viewManager.updateProjection();

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
