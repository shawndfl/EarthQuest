/**
 * Used to refresh geometry buffers when quads change
 */
export interface IRequestBufferRefresh {
  /**
   * Internal use only. This is to update the drawing layer when a quad changes
   * @returns
   */
  requestBufferRefresh: () => void;
}
