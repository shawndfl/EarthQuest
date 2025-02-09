interface PlayerStats {
  health: number;
  maxHealth: number;
}
/**
 * Data for the player
 */
export class PlayerData {
  stats: PlayerData;
  position: { i: number; j: number; k: number } = null;
  gold: number = 0;
  timePlayed: { h: number; m: number; s: number } = { h: 0, m: 0, s: 0 };
}
