import { Engine } from '../core/Engine';

/**
 * Used to build a  visual dialog
 */
export interface IDialogParams {
  iconScale: number;

  tileWidth: number;
  tileHeight: number;

  xPos: number;
  yPos: number;

  /** Used in animating value to xpos */
  activeX: number;
  /** Used in animating value to ypos */
  activeY: number;
  /** Used in animating value to width */
  activeWidth: number;
  /** Used in animating value to height */
  activeHeight: number;

  /** width of the dialog in pixels left to right */
  width: number;
  height: number;

  minWidth: number;
  minHeight: number;

  textOffsetX: number;
  textOffsetY: number;

  textWidth: number;
  textHeight: number;

  continueIconX: number;
  continueIconY: number;

  eng: Engine;
}
