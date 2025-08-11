import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import rect from '../math/rect';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';

/**
 * Creates the quads that make up the dialog box.
 */
export class DialogComponent extends Component {
  protected _quads: Quad[] = [];
  protected tileData: RuntimeTileData;
  protected texture: Texture;
  protected width: number;
  protected height: number;
  protected alpha: number;
  protected position: vec2;

  constructor(eng: Engine, tileData: RuntimeTileData, texture: Texture) {
    super(eng);
    this.tileData = tileData;
    this.texture = texture;
  }

  createQuad(pos: vec2, width: number, height: number, alpha: number = 1.0): Quad[] {
    this._quads = [];
    this.position = pos;
    this.width = width;
    this.height = height;
    this.alpha = alpha;
    this._quads.push(this.createCenterQuad());
    this._quads.push(this.createTopRightQuad());
    this._quads.push(this.createTopLeftQuad());
    this._quads.push(this.createLeftQuad());
    this._quads.push(this.createRightQuad());
    this._quads.push(this.createTopQuad());
    this._quads.push(this.createBottomQuad());
    this._quads.push(this.createBottomLeftQuad());
    this._quads.push(this.createBottomRightQuad());

    return this._quads;
  }

  protected createCenterQuad(): Quad {
    const width = this.width - 16;
    const height = this.height - 16;
    const imageName = 'center';
    const offset = new vec2(this.width / 2, this.height / 2);

    return this.createQuadImp(width, height, imageName, offset, 0.8);
  }

  protected createTopLeftQuad(): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'top:left';
    const offset = new vec2(width / 2, this.height - height / 2);

    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createTopRightQuad(): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'top:right';
    const offset = new vec2(this.width - width / 2, this.height - height / 2);

    return this.createQuadImp(width, height, imageName, offset);
  }
  protected createBottomRightQuad(): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'bottom:right';
    const offset = new vec2(this.width - width / 2, height / 2);

    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createBottomLeftQuad(): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'bottom:left';
    const offset = new vec2(width / 2, height / 2);

    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createLeftQuad(): Quad {
    const width = 8;
    const height = this.height - 16;
    const imageName = 'center:left';
    const offset = new vec2(width / 2, height / 2 + width);

    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createTopQuad(): Quad {
    const width = this.width - 16;
    const height = 8;
    const imageName = 'top:center';
    const offset = new vec2(width / 2 + 8, this.height - 8 / 2);

    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createBottomQuad(): Quad {
    const width = this.width - 16;
    const height = 8;
    const imageName = 'bottom:center';
    const offset = new vec2(width / 2 + 8, height / 2);

    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createRightQuad(): Quad {
    const width = 8;
    const height = this.height - 16;
    const imageName = 'center:right';
    const offset = new vec2(this.width - width / 2, height / 2 + 8);

    return this.createQuadImp(width, height, imageName, offset);
  }

  protected createQuadImp(width: number, height: number, imageName: string, offset: vec2, alpha: number = 1.0): Quad {
    const pos = this.position;

    const transform = new mat4();
    transform.setIdentity();
    transform.translate(new vec3(pos.x, pos.y, 0));
    transform.scale(vec3.one);

    const sourceSize = this.tileData.images.get(imageName).size;
    const sourcePos = this.tileData.images.get(imageName).pos;

    const uvTransform = new mat3();
    const scaleX = sourceSize.x / this.texture.width;
    const scaleY = sourceSize.y / this.texture.height;
    const offsetU = sourcePos.x / this.texture.width;
    const offsetV = sourcePos.y / this.texture.height;

    uvTransform.setIdentity();
    uvTransform.scale(new vec2(scaleX, scaleY));
    uvTransform.setTranslation(new vec2(offsetU, 1 - scaleY - offsetV));

    // create a quad
    const quad = {
      width,
      height,
      // offset quad to the  center
      offset,
      transform,
      uvTransform,
      mirrorX: false,
      mirrorY: false,
      alpha: alpha,
      hueAngle: 0,
    };
    return quad;
  }
}
