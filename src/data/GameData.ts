import { EnvironmentData } from './EnvironmentData';
import { PlayerData } from './PlayerData';

/**
 * Saves all the game data
 */
export class GameData {
  environment: EnvironmentData = new EnvironmentData();
  player: PlayerData = new PlayerData();
}
