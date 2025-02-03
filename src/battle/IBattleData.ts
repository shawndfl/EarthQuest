/**
 * The graphics used in the battle scene
 */
export interface IBattleGraphics {
  background: string;
  surface: string;
  rightSide: string;
  leftSide: string;
}

/**
 * Used to build a battle
 */
export interface IBattleData {
  song?: string;
  graphics?: IBattleGraphics;
  enemies?: [
    {
      id: string;
      tile: [number, number];
    }
  ];
}
