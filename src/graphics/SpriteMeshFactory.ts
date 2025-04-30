import { Component } from '../components/Component';
import { SpriteData } from '../environment/ILevelData2';
import { clamp } from '../math/constants';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { TileManager } from '../systems/TileManager';
import { GlBuffer, IQuadModel } from './GlBuffer';
import { Texture } from './Texture';

/**
 * This holds a collection of quads and their buffer and texture.
 * The sprite data is used to manipulate quads and define behavior.
 * Not every quad needs to have sprite data some are just static tiles that never
 * change.
 */
export class SpriteMesh {
  public get id(): string {
    return this._id;
  }
  public get graphicsBuffer(): GlBuffer {
    return this._graphicBuffer;
  }

  public get texture(): Texture {
    return this._texture;
  }

  public get quads(): IQuadModel[] {
    return this._quads;
  }

  public get data(): Map<string, SpriteData> {
    return this._data;
  }

  private _quads: IQuadModel[];
  private _data: Map<string, SpriteData>;

  constructor(private _id: string, private _graphicBuffer: GlBuffer, private _texture: Texture) {
    this._quads = [];
    this._data = new Map();
  }

  initialize(tileManager: TileManager): void {
    // create all the sprite controllers from the sprite data we have
    this._data.forEach((sd) => tileManager.createSpriteController(sd));

    this.graphicsBuffer.createBuffer();
    this.graphicsBuffer.setBuffers(this.quads, false);
  }
}

export class SpriteMeshFactory extends Component {
  /**
   * Creates a list of quads from the level data.
   * @param tiles - a location based lookup for each tile
   * @param spriteData - describes a sprite and a type used to assign behaviors later
   * @param textures - all the textures used to create this tile map
   * @param tileScale - a scale for the tiles. This will be multiplied by 8
   * @returns
   */
  createSpriteMeshes(
    tiles: { [loc: string]: string },
    spriteData: { [loc: string]: SpriteData },
    textures: Map<string, Texture>,
    tileScale: number
  ): SpriteMesh[] {
    // gets the i,j,k location for all the tiles
    const sprites = Object.keys(tiles);

    // uv steps
    const tileSize = 8 * tileScale;

    const height = this.eng.canvasController.canvasGL.height;
    const invHeight = 1 / height;
    const textureKeys = Array.from(textures.keys());
    const firstTexture = textures.get(textureKeys[0]);

    const spriteMeshes: SpriteMesh[] = textureKeys.map<SpriteMesh>((k) => {
      return new SpriteMesh(k, new GlBuffer(this.gl), textures.get(k));
    });

    // loop over all the sprites in the level
    for (let sprite of sprites) {
      // parse the location. They may have ranges like i2 and j2
      const [i, j, ktmp, i2, j2] = sprite.split(',').map((i) => Number.parseFloat(i));

      // what sprite or tile should be at this location
      const value: string = tiles[sprite];

      // this is the source location of the sprite
      let x, y, w, h;

      // start with the first texture
      let textureId = textureKeys[0];
      let texture: Texture = firstTexture;

      // if there is data use it
      const data = spriteData[value];
      if (data) {
        const imageKeys = Object.keys(data.images);
        // we will grab the first image's loc data
        [x, y, w, h] = data.images[imageKeys[0]].split(',').map((i) => Number.parseFloat(i));
        // also get the texture
        texture = textures.get(data.textureId);
        textureId = data.textureId;

        // save the texture
        data.texture = texture;
        // save the value as the id for this sprite
        data.id = value;
      } else {
        // if there is no sprite data in the file assume it's a location in
        // the first texture
        [x, y, w, h] = value.split(',').map((i) => Number.parseFloat(i));
      }

      const spriteStepX = 1.0 / texture.width;
      const spriteStepY = 1.0 / texture.height;
      const iStep = i * tileSize;
      const jStep = height - j * tileSize;
      const top = jStep + h * tileScale;

      const k = Number.isNaN(ktmp) || ktmp === undefined ? 0 : ktmp;
      const depth = clamp((jStep - k * tileSize) * invHeight, 0, 1);

      // get the quad from the texture id
      // each texture is a separate draw call.
      const spriteMesh = spriteMeshes.find((t) => t.id == textureId);
      const quads = spriteMesh.quads;
      const datas = spriteMesh.data;
      const quad = {
        min: new vec3(iStep, jStep, depth),
        max: new vec3(iStep + w * tileScale, top, depth),
        minTex: new vec2(spriteStepX * x, 1 - spriteStepY * y),
        maxTex: new vec2(spriteStepX * (x + w), 1 - spriteStepY * (y + h)),
      };

      quads.push(quad);
      if (data) {
        // keep the quad with the sprite data
        // so we can change it later
        data.quad = quad;
        datas.set(data.id, data);
      }

      // if there is an i2 and j2 add all the quads for it.
      // this is used to place tiles in a range of i2 and j2
      if (!!i2 && !!j2) {
        for (let ni = i; ni <= i2; ni++) {
          const iStep = ni * tileSize;
          for (let nj = j; nj <= j2; nj++) {
            const jStep = height - nj * tileSize;
            const top = jStep + h * tileScale;
            const depth = clamp((jStep - k * tileSize) * invHeight, 0, 1);
            const quad = {
              min: new vec3(iStep, jStep, depth),
              max: new vec3(iStep + w * tileScale, top, depth),
              minTex: new vec2(spriteStepX * x, 1 - spriteStepY * y),
              maxTex: new vec2(spriteStepX * (x + w), 1 - spriteStepY * (y + h)),
            };

            // if data keep track of the other quads
            if (data) {
              if (!data.otherQuads) {
                data.otherQuads = [];
              }
              data.otherQuads.push(quad);
            }
            // save the quad
            quads.push(quad);
          }
        }
      }
    }
    return spriteMeshes;
  }
}
