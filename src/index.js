import { CanvasController } from './core/CanvasController';
import { Scene } from './core/Scene';

import './css/canvas.css';

/**
 * Create the only instance of a canvas controller
 */
const canvas = new CanvasController();
const scene = new Scene();

scene.init(canvas.gl);
scene.update();
document.body.appendChild(canvas.component());
