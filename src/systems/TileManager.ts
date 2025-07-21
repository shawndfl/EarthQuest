import { Component } from '../core/Component';
import { ILevelData, TileData } from '../data/ILevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';

/**
 * Create two layers of tiles.
 * 800x600 visible tiles. Allow for overflow on all sides
 */
export class TileManager extends Component {
  private _textures: Map<string, Texture>;
  private _defaultTexture: Texture;
  private _buffer: GlBuffer;
  private _shader: SpritePerspectiveShader;

  /**
   * Create the tiles
   */
  async initialize(): Promise<void> {
    this._textures = new Map();
    this._buffer = new GlBuffer(this.gl);
    this._shader = new SpritePerspectiveShader(this.gl, 'scene');

    // get the texture
  }

  async loadLevel(level: ILevelData): Promise<void> {
    const promise = [];
    console.debug('TileManager loading level...');

    // load all the textures
    for (let key of Object.keys(level.textures)) {
      const texturePath = level.textures[key];
      const texture = new Texture(this.gl);
      promise.push(texture.loadImage(texturePath));
      this._textures.set(key, texture);
      if (!this._defaultTexture) {
        this._defaultTexture = texture;
      }
    }

    await Promise.all(promise);
    const quads: Quad[] = [];
    for (let location of Object.keys(level.layer1)) {
      const cmdLoc = this.getLocationFromString(location);
      const loc = cmdLoc.point;
      const cmd = cmdLoc.command;
      const spriteId = level.layer1[location];
      const spriteData = level.tiles[spriteId];
      if (!spriteData) {
        console.error('Missing sprite data for ' + spriteId);
        return;
      }

      if (cmd == 'line') {
        this.placeQuadsInLine(loc, spriteData, quads);
      } else if (cmd == 'fill') {
        this.placeQuadsInFill(loc, spriteData, quads);
      } else {
        this.placeSingleQuad(loc, spriteData, quads);
      }
    }
    // set the openGL buffers
    const geo = QuadGeometry.CreateQuad(quads);
    this._buffer.setBuffers(geo);

    // setup the shader
    this._shader.setSpriteSheet(this._defaultTexture);
  }

  private addLayer(): void {}
  /**
   * Create a line of quads
   * @param loc
   * @param spriteData
   */
  private placeSingleQuad(loc: vec4, spriteData: TileData, quads: Quad[]): void {
    const lineStep = 8;
    const sourceLocation = this.getLocationFromString(spriteData.sourceLocation, true).point;

    const x = loc.x;
    const y = loc.y;
    const quad = this.placeQuad({
      posX: x * 2,
      posY: y * 2,
      posZ: 0,
      alpha: 1,
      hue: 0,
      texture: this.getTextureFromId(spriteData.sourceTextureId),
      sourcePixelX: sourceLocation.x,
      sourcePixelY: sourceLocation.y,
      sourcePixelWidth: sourceLocation.z,
      sourcePixelHeight: sourceLocation.w,
    });
    quads.push(quad);
  }

  /**
   * Create a line of quads
   * @param loc
   * @param spriteData
   */
  placeQuadsInLine(loc: vec4, spriteData: TileData, quads: Quad[]): void {
    const lineStep = 8;
    const p0 = new vec2(loc.x, loc.y);
    const p1 = new vec2(loc.z, loc.w);
    const dist = p0.subtract(p1).length() / lineStep;
    const sourceLocation = this.getLocationFromString(spriteData.sourceLocation, true).point;

    for (let t = 0; t < dist; t++) {
      const x = loc.x + Math.sign(loc.z - loc.x) * t * lineStep;
      const y = loc.y + Math.sign(loc.w - loc.y) * t * lineStep;
      const quad = this.placeQuad({
        posX: x * 2,
        posY: y * 2,
        posZ: 0,
        alpha: 1,
        hue: 0,
        texture: this.getTextureFromId(spriteData.sourceTextureId),
        sourcePixelX: sourceLocation.x,
        sourcePixelY: sourceLocation.y,
        sourcePixelWidth: sourceLocation.z,
        sourcePixelHeight: sourceLocation.w,
      });
      quads.push(quad);
    }
  }

  /**
   * Create a line of quads
   * @param loc
   * @param spriteData
   */
  placeQuadsInFill(loc: vec4, spriteData: TileData, quads: Quad[]): void {
    const sourceLocation = this.getLocationFromString(spriteData.sourceLocation, true).point;

    for (let x = loc.x; x < loc.z; x += sourceLocation.z) {
      for (let y = loc.y; y < loc.w; y += sourceLocation.w) {
        const quad = this.placeQuad({
          posX: x * 2,
          posY: y * 2,
          posZ: 0,
          alpha: 1,
          hue: 0,
          texture: this.getTextureFromId(spriteData.sourceTextureId),
          sourcePixelX: sourceLocation.x,
          sourcePixelY: sourceLocation.y,
          sourcePixelWidth: sourceLocation.z,
          sourcePixelHeight: sourceLocation.w,
        });
        quads.push(quad);
      }
    }
  }

  private getTextureFromId(id: string): Texture {
    if (!id) {
      return this._defaultTexture;
    }
    return this._textures.get(id);
  }

  private placeQuad(options: {
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
    return {
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
  }

  /**
   * Parses the location from a string
   * @param location
   * @returns
   */
  getLocationFromString(location: string, skipCommand?: boolean): { command: string; point: vec4 } {
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
    //Render
    // baseLayer - includes background, and sprites sorted from top to bottom
    // Clear the canvas before we start drawing on it.
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this._shader.enable();
    const scale = 1;
    const adjustX = this.eng.width - this.eng.width * scale;
    const adjustY = this.eng.height - this.eng.height * scale;

    const proj = mat4.orthographic(adjustX, this.eng.width * scale, adjustY, this.eng.height * scale, 0, 1);

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
