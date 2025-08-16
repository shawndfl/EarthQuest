import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import { RuntimeTileData } from '../data/RuntimeLevelData';
import { Quad } from '../graphics/QuadGeometry';
import { Texture } from '../graphics/Texture';
import mat3 from '../math/mat3';
import mat4 from '../math/mat4';
import vec2 from '../math/vec2';
import vec3 from '../math/vec3';

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
    this._quads = [];
    for (let i = 0; i < 9; i++) {
      this._quads.push(this.defaultQuad());
    }
  }

  protected defaultQuad(): Quad {
    return {
      uuid: this.eng.random.getUuid(),
      width: 0,
      height: 0,
      // offset quad to the  center
      offset: new vec2(),
      transform: mat4.identity,
      uvTransform: mat3.identity,
      mirrorX: false,
      mirrorY: false,
      alpha: 1.0,
      hueAngle: 0,
    };
  }

  createQuad(pos: vec2, width: number, height: number, alpha: number = 1.0): Readonly<Quad[]> {
    this.position = pos;
    this.width = width;
    this.height = height;
    this.alpha = alpha;

    this.createTopRightQuad(this._quads[0]);
    this.createTopQuad(this._quads[1]);
    this.createTopLeftQuad(this._quads[2]);

    this.createLeftQuad(this._quads[3]);
    this.createCenterQuad(this._quads[4]);
    this.createRightQuad(this._quads[5]);

    this.createBottomQuad(this._quads[6]);
    this.createBottomLeftQuad(this._quads[7]);
    this.createBottomRightQuad(this._quads[8]);

    return this._quads;
  }

  protected createCenterQuad(dest: Quad): Quad {
    const width = this.width - 16;
    const height = this.height - 16;
    const imageName = 'center';
    const offset = new vec2(this.width / 2, this.height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest, 0.8);
  }

  protected createTopLeftQuad(dest: Quad): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'top:left';
    const offset = new vec2(width / 2, this.height - height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createTopRightQuad(dest: Quad): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'top:right';
    const offset = new vec2(this.width - width / 2, this.height - height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }
  protected createBottomRightQuad(dest: Quad): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'bottom:right';
    const offset = new vec2(this.width - width / 2, height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createBottomLeftQuad(dest: Quad): Quad {
    const width = 8;
    const height = 8;
    const imageName = 'bottom:left';
    const offset = new vec2(width / 2, height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createLeftQuad(dest: Quad): Quad {
    const width = 8;
    const height = this.height - 16;
    const imageName = 'center:left';
    const offset = new vec2(width / 2, height / 2 + width);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createTopQuad(dest: Quad): Quad {
    const width = this.width - 16;
    const height = 8;
    const imageName = 'top:center';
    const offset = new vec2(width / 2 + 8, this.height - 8 / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createBottomQuad(dest: Quad): Quad {
    const width = this.width - 16;
    const height = 8;
    const imageName = 'bottom:center';
    const offset = new vec2(width / 2 + 8, height / 2);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  protected createRightQuad(dest: Quad): Quad {
    const width = 8;
    const height = this.height - 16;
    const imageName = 'center:right';
    const offset = new vec2(this.width - width / 2, height / 2 + 8);

    return this.createQuadImp(width, height, imageName, offset, dest);
  }

  /**
   * Creates a quad with the given inputs.
   * @param width
   * @param height
   * @param imageName
   * @param offset
   * @param dest - target quad if null one will be created
   * @param alpha - transparency of the quad
   * @returns
   */
  protected createQuadImp(
    width: number,
    height: number,
    imageName: string,
    offset: vec2,
    dest?: Quad,
    alpha: number = 1.0
  ): Quad {
    if (!dest) {
      dest = this.defaultQuad();
    }

    dest.width = width;
    dest.height = height;
    dest.offset.set(offset);
    dest.mirrorX = false;
    dest.mirrorY = false;
    dest.alpha = alpha;
    dest.hueAngle = 0;

    const pos = this.position;

    dest.transform.setIdentity();
    dest.transform.translate(new vec3(pos.x, pos.y, 0));
    dest.transform.scale(vec3.one);

    const sourceLocation = this.tileData.images.get(imageName);

    const scaleX = sourceLocation.z / this.texture.width;
    const scaleY = sourceLocation.w / this.texture.height;
    const offsetU = sourceLocation.x / this.texture.width;
    const offsetV = sourceLocation.y / this.texture.height;

    dest.uvTransform.setIdentity();
    dest.uvTransform.scale(new vec2(scaleX, scaleY));
    dest.uvTransform.setTranslation(new vec2(offsetU, 1 - scaleY - offsetV));

    return dest;
  }
}
