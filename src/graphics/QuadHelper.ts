import { Component } from '../components/Component';
import { clamp } from '../math/constants';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import { IQuadModel } from './GlBuffer';
import { Texture } from './Texture';

export class QuadHelper extends Component {
  createQuads(tiles: { [loc: string]: string }, texture: Texture, tileScale: number): IQuadModel[] {
    const quads = [];
    const sprites = Object.keys(tiles);

    // uv steps
    const spriteStepX = 1.0 / texture.width;
    const spriteStepY = 1.0 / texture.height;
    const tileSize = 8 * tileScale;

    const height = this.eng.canvasController.canvasGL.height;
    const invHeight = 1 / height;

    for (let sprite of sprites) {
      const [i, j, ktmp, i2, j2] = sprite.split(',').map((i) => Number.parseFloat(i));
      const value: string = tiles[sprite];
      const [x, y, w, h] = value.split(',').map((i) => Number.parseFloat(i));
      const iStep = i * tileSize;
      const jStep = height - j * tileSize;
      const top = jStep + h * tileScale;
      const k = Number.isNaN(ktmp) || ktmp === undefined ? 0 : ktmp;

      const depth = clamp((jStep - k * tileSize) * invHeight, 0, 1);
      //if (j == 5) {
      console.debug('sprite depth for (' + i + ', ' + j + '):  depth: ' + depth);
      //}
      quads.push({
        min: new vec3(iStep, jStep, depth),
        max: new vec3(iStep + w * tileScale, top, depth),
        minTex: new vec2(spriteStepX * x, 1 - spriteStepY * y),
        maxTex: new vec2(spriteStepX * (x + w), 1 - spriteStepY * (y + h)),
      });

      // if there is an i2 and j2 add all the quads for it.
      if (!!i2 && !!j2) {
        for (let ni = i; ni <= i2; ni++) {
          const iStep = ni * tileSize;
          for (let nj = j; nj <= j2; nj++) {
            const jStep = height - nj * tileSize;
            const top = jStep + h * tileScale;
            const depth = clamp((jStep - k * tileSize) * invHeight, 0, 1);

            console.debug('tile depth for (' + ni + ', ' + nj + '):  depth: ' + depth);

            quads.push({
              min: new vec3(iStep, jStep, depth),
              max: new vec3(iStep + w * tileScale, top, depth),
              minTex: new vec2(spriteStepX * x, 1 - spriteStepY * y),
              maxTex: new vec2(spriteStepX * (x + w), 1 - spriteStepY * (y + h)),
            });
          }
        }
      }
    }
    return quads;
  }
}
