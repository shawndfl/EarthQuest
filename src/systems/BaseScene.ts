import { TextManager } from './TextManager';

/**
 * This is a base scene for all scenes. This class holds instances of major
 * systems that players enemies and other components need access to.
 */
export class BaseScene {
  textManager: TextManager;

  constructor(protected gl: WebGL2RenderingContext) {}
}
