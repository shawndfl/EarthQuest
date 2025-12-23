import { Component } from '../../core/Component';
import { Engine } from '../../core/Engine';
import { RuntimeTileData } from '../../data/RuntimeLevelData';
import { GlBuffer } from '../../graphics/GlBuffer';
import { Quad, QuadGeometry } from '../../graphics/QuadGeometry';
import { Texture } from '../../graphics/Texture';
import { clamp } from '../../math/constants';
import { Curve, CurveType } from '../../math/Curve';
import mat3 from '../../math/mat3';
import mat4 from '../../math/mat4';
import vec2 from '../../math/vec2';
import vec3 from '../../math/vec3';
import vec4 from '../../math/vec4';
import { SceneType } from '../../scenes/SceneType';
import { UserAction } from '../../systems/InputManager';
import { DialogComponent } from './DialogComponent';

/**
 * Controls the dialog component. Manages option selection
 */
export class DialogController extends Component {
  protected component: DialogComponent;

  initialize(component: DialogComponent): void {
    this.component = component;
  }

  show(): void {
    //this.component.show();
  }
}
