/**
 * These are cell properties that are used by the Ground class
 * to make interesting levels.
 */
export interface ICellProps {
  id: string;
  heightIncreaseAxis: [number][number];
}

/**
 * This interface is used to build levels.
 */
export interface ILevelData {
  ids: string[];
  props: ICellProps[];
  cells: number[][][];
}
