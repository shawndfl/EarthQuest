import { Engine } from '../core/Engine';
import { BackgroundData } from '../data/BackgroundData';
import { GlBuffer } from '../graphics/GlBuffer';
import { PlanePrimitive } from '../graphics/PlanePrimitive';
import { SpritController } from '../graphics/SpriteController';
import { AssetManager } from '../systems/AssetManager';
import { Component } from './Component';

export class BackgroundComponent extends Component {
  plane: PlanePrimitive;

  constructor(eng: Engine) {
    super(eng);
    this.plane = new PlanePrimitive(this.eng);
  }

  async initialize(data: BackgroundData) {
    this.plane.initialize();
  }

  update(dt: number) {}
}
