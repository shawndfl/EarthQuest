import { Engine } from '../core/Engine';
import { PlanePrimitive } from '../graphics/PlanePrimitive';
import { Texture } from '../graphics/Texture';
import { BackgroundImageShader } from '../shaders/BackgroundImageShader';
import { Component } from './Component';

export class BackgroundComponent extends Component {
  plane: PlanePrimitive;
  shader: BackgroundImageShader;
  texture: Texture;

  constructor(eng: Engine) {
    super(eng);
  }

  async initialize() {
    this.plane = new PlanePrimitive(this.eng);
    this.plane.initialize(1.0);
    this.shader = new BackgroundImageShader(this.eng.gl, 'BackgroundShader');
    this.texture = new Texture(this.eng.gl);
    this.shader.setBackgroundImage(this.texture);
  }

  setImage(imageData: TexImageSource): void {
    this.texture.updateTexture(imageData);
  }

  update(dt: number) {
    this.shader.enable();
    this.plane.draw();
  }
}
