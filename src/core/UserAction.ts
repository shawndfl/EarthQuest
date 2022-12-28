/**
 * User input action.
 */
export enum UserAction {
  None = 0x00,
  Right = 0x01,
  Left = 0x02,
  Up = 0x04,
  Down = 0x08,

  UpRight = Right | Up,
  UpLeft = Left | Up,
  DownRight = Right | Down,
  DownLeft = Left | Down,

  Pause = 0x10,
  Action = 0x20,
  Cancel = 0x40,
  Menu = 0x80,
}
