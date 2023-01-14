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
