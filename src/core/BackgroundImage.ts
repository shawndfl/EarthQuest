import { Engine } from '../core/Engine';
import { PlaneMesh } from '../graphics/PlaneMesh';
import { Texture } from '../graphics/Texture';
import { BackgroundImageShader } from '../shaders/BackgroundImageShader';
import { Component } from './Component';

export class BackgroundImage extends Component {
  plane: PlaneMesh;
  shader: BackgroundImageShader;
  texture: Texture;

  constructor(eng: Engine) {
    super(eng);
  }

  async initialize() {
    this.plane = new PlaneMesh(this.eng);
    this.plane.initialize();

    this.shader = new BackgroundImageShader(this.eng.gl, 'BackgroundShader');
    this.texture = new Texture(this.eng.gl);
    this.shader.setBackgroundImage(this.texture);
  }

  setTexture(texture: Texture): void {
    this.shader.setBackgroundImage(texture);
  }

  setImage(imageData: TexImageSource): void {
    this.texture.updateTexture(imageData);
  }

  update(dt: number) {
    this.shader.enable();
    this.plane.draw();
  }
}
