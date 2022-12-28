import { BaseScene } from '../systems/BaseScene';

export class PlayerController {
  constructor(private gl: WebGL2RenderingContext, public scene: BaseScene) {}
}
