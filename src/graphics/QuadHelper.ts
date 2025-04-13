import { Component } from '../components/Component';
import { SpriteData } from '../environment/ILevelData2';
import { clamp } from '../math/constants';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { GlBuffer, IQuadModel } from './GlBuffer';
import { Texture } from './Texture';

export interface SpriteMesh {
  id: string;
  graphicsBuffer: GlBuffer;
  texture: Texture;
  quads: IQuadModel[];
}

export class QuadHelper extends Component {
  createQuads(
    tiles: { [loc: string]: string },
    spriteData: { [loc: string]: SpriteData },
    textures: Map<string, Texture>,
    tileScale: number
  ): SpriteMesh[] {
    const sprites = Object.keys(tiles);

    // uv steps
    const tileSize = 8 * tileScale;

    const height = this.eng.canvasController.canvasGL.height;
    const invHeight = 1 / height;
    const textureKeys = Array.from(textures.keys());
    const firstTexture = textures.get(textureKeys[0]);

    const spriteMeshes: SpriteMesh[] = textureKeys.map<SpriteMesh>((k) => {
      return {
        id: k,
        graphicsBuffer: new GlBuffer(this.gl),
        texture: textures.get(k),
        quads: [],
      };
    });

    for (let sprite of sprites) {
      const [i, j, ktmp, i2, j2] = sprite.split(',').map((i) => Number.parseFloat(i));
      const value: string = tiles[sprite];
      let x, y, w, h;

      let textureId = textureKeys[0];
      let texture: Texture = firstTexture;

      // if there is data use it
      const data = spriteData[value];
      if (data) {
        const imageKeys = Object.keys(data.images);
        // we will grab the first image's loc data
        [x, y, w, h] = data.images[imageKeys[0]].split(',').map((i) => Number.parseFloat(i));
        // also get the texture
        texture = textures.get(data.texture);
        textureId = data.texture;
      } else {
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
      const quads = spriteMeshes.find((t) => t.id == textureId).quads;
      quads.push(
        this.adjustQuad(data, {
          min: new vec3(iStep, jStep, depth),
          max: new vec3(iStep + w * tileScale, top, depth),
          minTex: new vec2(spriteStepX * x, 1 - spriteStepY * y),
          maxTex: new vec2(spriteStepX * (x + w), 1 - spriteStepY * (y + h)),
        })
      );

      // if there is an i2 and j2 add all the quads for it.
      if (!!i2 && !!j2) {
        for (let ni = i; ni <= i2; ni++) {
          const iStep = ni * tileSize;
          for (let nj = j; nj <= j2; nj++) {
            const jStep = height - nj * tileSize;
            const top = jStep + h * tileScale;
            const depth = clamp((jStep - k * tileSize) * invHeight, 0, 1);

            console.debug('tile depth for (' + ni + ', ' + nj + '):  depth: ' + depth);

            quads.push(
              this.adjustQuad(data, {
                min: new vec3(iStep, jStep, depth),
                max: new vec3(iStep + w * tileScale, top, depth),
                minTex: new vec2(spriteStepX * x, 1 - spriteStepY * y),
                maxTex: new vec2(spriteStepX * (x + w), 1 - spriteStepY * (y + h)),
              })
            );
          }
        }
      }
    }
    return spriteMeshes;
  }

  private adjustQuad(data: SpriteData, quad: IQuadModel): IQuadModel {
    if (!data) {
      return quad;
    }

    if (data.flipX) {
    }

    if (data.flipY) {
    }

    if (data.rotateDegrees) {
    }
    return quad;
  }
}
