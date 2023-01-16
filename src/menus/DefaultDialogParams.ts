import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { IDialogParams } from './IDialogParams';

/**
 * Used to build a  visual dialog
 */
export class DefaultDialogParams extends Component implements IDialogParams {
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
  activeX: number;
  activeY: number;
  activeWidth: number;
  activeHeight: number;

  constructor(eng: Engine) {
    super(eng);
    this.activeX = 0;
    this.activeY = 0;
    this.activeWidth = 0;
    this.activeHeight = 0;
    this.xPos = 20;
    this.yPos = 40;
    this.width = 600;
    this.height = 300;
    this.continueIconX = 350;
    this.continueIconY = 75;
    this.tileWidth = 8;
    this.tileHeight = 8;
    this.iconScale = 3;
    this.minWidth = 20;
    this.minHeight = 20;
    this.textHeight = 50;
    this.textWidth = 300;
    this.textOffsetX = 20;
    this.textOffsetY = 50;
  }
}
