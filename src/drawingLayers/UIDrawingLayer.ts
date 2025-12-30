import mat4 from '../math/mat4';
import { DrawingLayer } from './DrawingLayer';

/**
 * This will alow the layer to draw ui components
 */
export class UiDrawingLayer extends DrawingLayer {
  protected _projection: mat4;

  protected getProjection(): Readonly<mat4> {
    if (!this._projection) {
      this._projection = mat4.orthographic(0, this.eng.width, 0, this.eng.height, 1, -1, this._projection);
    }
    return this._projection;
  }
}
