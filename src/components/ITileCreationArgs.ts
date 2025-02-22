import { GroundManager } from '../systems/GroundManager';

/**
 * Used to create tiles
 */
export interface ITileCreationArgs {
  type: string;
  sprite: string;
  flags: string[];
  i: number;
  j: number;
  k: number;
  groundManager: GroundManager;
}
