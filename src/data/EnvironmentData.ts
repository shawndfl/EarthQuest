/**
 * Environment data for the game
 */
export class EnvironmentData {
  /** what level to load */
  level: string;
  /** seed for generating the level */
  seed: number = 1001;

  /** number of gold in this level */
  gold: number = 20;

  /** Show what gold was collected in this level */
  goldCollected: { x: number; y: number }[];
}
