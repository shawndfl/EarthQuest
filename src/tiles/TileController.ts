import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { GlBuffer } from '../graphics/GlBuffer';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import mat3 from '../math/mat3';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { DrawingLayer } from '../systems/DrawingLayer';

export interface TileControllerOptions {
  quad: Quad;
  tileData: RuntimeTileData;
  sourceTexture: Texture;
  buffer: GlBuffer;
  drawingLayer: DrawingLayer;
}

/**
 * This is a base class for managing a tile.
 */
export abstract class TileController extends Component {
  /**
   * The texture applied to this quad
   */
  public get texture(): Texture {
    return this.options.sourceTexture;
  }
  /**
   * The quad that will be managed by this tile controller.
   */
  public get quad(): Quad {
    return this.options.quad;
  }

  /**
   * The tile data that describes how this controller should behave
   */
  public get tileData(): RuntimeTileData {
    return this.options.tileData;
  }

  /**
   * The image passed into setImage
   */
  protected activeImage: string;

  constructor(eng: Engine, protected options: TileControllerOptions) {
    super(eng);
  }

  requestGeometryRefresh(): void {
    this.options.drawingLayer.requestRefresh();
  }

  /**
   * Initialize the controller
   * @param quad
   * @param tileData
   */
  abstract initialize(): Promise<void>;

  /**
   * Perform an updates for this tile
   * @param dt
   */
  abstract update(dt: number): void;

  /**
   * Get the location from a csv string. Should be in the format of [x,y,width,height]
   * @param location
   * @returns
   */
  protected getLocationFromString(location: string): vec4 {
    const point = new vec4();
    try {
      const components = location.split(',');
      let i = 0;

      point.x = parseFloat(components[i++]);
      point.y = parseFloat(components[i++]);
      point.z = parseFloat(components[i++]);
      point.w = parseFloat(components[i++]);
    } catch (e) {
      console.error('Cannot parse "' + location + '" expecting [x,y,z,w]');
    }

    return point;
  }

  /**
   * Sets an image for a quad using the tile data images.
   * @param name
   */
  setImage(name: string, flipX?: boolean, flipY?: boolean): void {
    const imageLoc = this.options.tileData.data.images?.[name];
    if (imageLoc) {
      this.activeImage = name;
      const texture = this.options.sourceTexture;
      const [sourcePixelX, sourcePixelY, sourcePixelWidth, sourcePixelHeight] =
        this.getLocationFromString(imageLoc).xyzw;
      const uvTransform = new mat3();
      const scaleX = sourcePixelWidth / texture.width;
      const scaleY = sourcePixelHeight / texture.height;
      const offsetU = sourcePixelX / texture.width;
      const offsetV = sourcePixelY / texture.height;
      uvTransform.setIdentity();
      uvTransform.scale(new vec2(scaleX, scaleY));
      uvTransform.setTranslation(new vec2(offsetU, 1 - scaleY - offsetV));
      this.quad.uvTransform = uvTransform;
      this.quad.mirrorX = flipX;
      this.quad.mirrorY = flipY;
      this.options.drawingLayer.requestRefresh();
    } else {
      console.error('cannot find image ' + name);
    }
  }
}
