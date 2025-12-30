import { Engine } from '../../core/Engine';
import { RuntimeTileData } from '../../data/RuntimeLevelData';
import { DrawingLayer } from '../../drawingLayers/DrawingLayer';
import vec2 from '../../math/vec2';
import vec3 from '../../math/vec3';

export interface DialogIconOptions {
  position: vec3;
  width?: number;
  height?: number;
  imageName: string;
  offset?: vec2;
  alpha?: number;
  visible?: boolean;
}

export class DialogIcon extends RuntimeTileData {
  protected _options: DialogIconOptions;

  constructor(eng: Engine, drawingLayer: DrawingLayer) {
    super(eng, 'icon', 'Dialog Menu', drawingLayer);
  }

  initialize(options: DialogIconOptions): void {
    this._options = options;

    this.width = options.width ?? 8;
    this.height = options.height ?? 8;
    this.offset = options.offset?.copy() ?? new vec2();
    this.mirrorX = false;
    this.mirrorY = false;
    this.alpha = options.alpha ?? 1;
    this.hueAngle = 0;
    this.visible = options.visible ?? true;

    this.setTileTransform({
      position: options.position,
    });
    this.setImage(options.imageName);
  }

  update(dt: number): void {}
}
