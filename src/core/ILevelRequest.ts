import { Component } from '../components/Component';
import { ILevelData } from '../environment/ILevelData';

export enum LevelRequest {
  levelUrl,
  levelData,
  battleUrl,
  previousLevel, // just load the last level data you have if any
}

/**
 * Request for a level
 */
export interface ILevelRequest {
  requestType: LevelRequest;
  levelData?: ILevelData;
  levelUrl?: string;
}
