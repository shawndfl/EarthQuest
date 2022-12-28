import { CanvasController } from './core/CanvasController';
import * as css from './utilities/CssController';
import './css/canvas.css';

/**
 * Create the only instance of a canvas controller
 */
const canvas = new CanvasController();

document.body.appendChild(canvas.component());
//css.LoadCss('./css/canvas.css');
