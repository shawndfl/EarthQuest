import { GlBuffer, IQuadModel } from '../core/GlBuffer';
import { Texture } from '../core/Texture';
import { TileBuilder } from './TileBuilder';

export interface ISpriteData {
  textureWidth: string;
  sprites: [
    {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  ];
}

export class SpritController {
  spriteSheet: Texture;
  spriteData: ISpriteData;

  buffer: GlBuffer;

  constructor(private gl: WebGL2RenderingContext) {}

  initialize(texture: Texture, spriteData: ISpriteData) {
    //this.buffer.setBuffers();
  }

  loadSprite(quadId: number) {}
}
