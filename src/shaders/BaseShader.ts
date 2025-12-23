import { ShaderController } from '../graphics/ShaderController';

/**
 * Base shader that can be enabled
 */
export abstract class BaseShader {
  protected _shader: ShaderController;

  constructor(protected gl: WebGL2RenderingContext, shaderId: string) {
    this._shader = new ShaderController(this.gl, shaderId);
  }

  enable(): void {
    this._shader.enable();
  }
}
