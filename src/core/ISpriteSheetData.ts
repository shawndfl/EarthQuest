/**
 * This interface is used to describe a tile quad
 */
export interface ISpriteSheetData {
  sprites: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
}
