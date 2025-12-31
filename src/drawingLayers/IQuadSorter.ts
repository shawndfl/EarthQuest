import { Quad } from '../graphics/QuadGeometry';

export interface IQuadSorter {
  /**
   * Sorts a bunch of quads
   * @param quads
   */
  sort(quads: Quad[]): Quad[];
}
