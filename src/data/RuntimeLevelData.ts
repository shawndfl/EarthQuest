import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { Texture } from '../graphics/Texture';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { ILevelData, TileData } from './ILevelData';

export class RuntimeTileData {
  /**
   * Position in pixels of the source image
   */
  sourcePosition: vec2;
  /**
   * Size in pixels of the source image. Mostly 8x8
   */
  sourceSize: vec2;

  tileSize: vec2;
  tilePosition: vec2;

  get data(): Readonly<TileData> {
    return this._tileData;
  }

  private _images: Map<string, { pos: vec2; size: vec2 }>;
  get images(): Map<string, { pos: vec2; size: vec2 }> {
    return this._images;
  }

  getImageNames(): string[] {
    return Array.from(this._images.keys());
  }

  constructor(private _tileData: TileData) {
    this._images = new Map();
    const point = this.getLocationFromString(_tileData.sourceLocation);
    this.sourcePosition = new vec2(point.x, point.y);
    this.sourceSize = new vec2(point.z, point.w);
    this.tileSize = new vec2(_tileData.tileWidth ?? this.sourceSize.x, _tileData.tileHeight ?? this.sourceSize.y);
    this.tilePosition = new vec2(_tileData.tileXOffset ?? 0, _tileData.tileYOffset ?? 0);

    // add in all the images
    if (this._tileData.images) {
      Object.keys(this._tileData.images).forEach((k) => {
        const point = this.getLocationFromString(this._tileData.images[k]);
        const pos = new vec2(point.x, point.y);
        const size = new vec2(point.z, point.w);
        this._images.set(k, { pos, size });
      });
    }
  }
  /**
   * Parses the location from a string
   * @param location
   * @returns
   */
  getLocationFromString(location: string): vec4 {
    const components = location.split(',');
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
}

export class RuntimeLevelData extends Component {
  get data(): ILevelData {
    return this._levelData;
  }

  protected _tiles: Map<string, RuntimeTileData>;
  get tiles(): Map<string, RuntimeTileData> {
    return this._tiles;
  }

  protected _textures: Texture[];
  get textures(): Texture[] {
    return this._textures;
  }

  private _textureLoadPromise: Promise<Texture>[];

  constructor(eng: Engine, protected _levelData: ILevelData) {
    super(eng);
    this._textureLoadPromise = _levelData.textures.map((t) => eng.assetManager.getTexture(t));
    this._tiles = new Map();
    this._textures = [];
    Object.keys(_levelData.tiles).forEach((k) => this._tiles.set(k, new RuntimeTileData(_levelData.tiles[k])));
  }

  async waitForTextures(): Promise<void> {
    await Promise.all(this._textureLoadPromise).then((values) => {
      this._textures.push(...values);
    });
  }
}
