import { Engine } from '../core/Engine';
import { BackgroundData } from '../data/BackgroundData';
import { GlBuffer } from '../graphics/GlBuffer';
import { PlanePrimitive } from '../graphics/PlanePrimitive';
import { SpritController } from '../graphics/SpriteController';
import { BackgroundImageShader } from '../shaders/BackgroundImageShader';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import { AssetManager } from '../systems/AssetManager';
import { Component } from './Component';

export class BackgroundComponent extends Component {
  plane: PlanePrimitive;
  shader: BackgroundImageShader;

  constructor(eng: Engine) {
    super(eng);
    this.plane = new PlanePrimitive(this.eng);
    this.shader = new BackgroundImageShader(this.eng.gl, 'BackgroundShader');
  }

  async initialize(data: BackgroundData) {
    this.plane.initialize();
    this.shader.setBackgroundImage(data.image);
  }

  update(dt: number) {
    this.shader.enable();
    this.plane.draw();
  }
}
