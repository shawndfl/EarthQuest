import { TileComponent } from './TileComponent';

/**
 * Interface used in canAccessTile functions
 */
export interface TileAccessOptions {
  ignoreEmpty: boolean;
  tileBelow: TileComponent;
}
