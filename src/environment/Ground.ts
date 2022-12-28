import { Texture } from '../core/Texture';
import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import vec2 from '../math/vec2';

export class Ground {
  private _texture: Texture;
  private _buffer: GlBuffer;

  constructor() {}

  initialize(texture: Texture) {
    const quads: IQuadModel[] = [
      {
        max: [1, 1],
        min: [0, 0],
        maxTex: [0.4, 0.4],
        minTex: [0, 0],
      },
    ];

    this._buffer.setBuffers(quads);
    this._texture = texture;
  }

  update(dt: number) {}
}
