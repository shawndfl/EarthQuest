import { GlBuffer } from './GlBuffer';
import * as mat4 from '../math/mat4';

/**
 * Sample scene
 */
export class Scene {
  quad;

  constructor() {}

  init() {
    console.log('init');

    const m = mat4.create();
    console.debug(m);
    this.quad = new GlBuffer();
  }

  update() {
    console.log('updating');
  }

  dispose() {
    console.log('dispose');
  }
}
