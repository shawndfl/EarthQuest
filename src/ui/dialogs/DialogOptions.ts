import vec2 from '../../math/vec2';
import vec4 from '../../math/vec4';

export interface DialogUserOptions {
  optionText: string;
}

export const DialogOptionsWaitForInput = '/x0a';
export const DialogOptionsUserOption = '/x09';

export interface DialogOptions {
  /** use to id this dialog text */
  id: string;
  /**
   * what to show in the dialog
   *  special character
   */
  text: string;
  textPadding: number;
  fontScale: number;
  /** position in screen space 0,0 is bottom left */
  position: vec2;
  width: number;
  height: number;
  color: vec4;
  /** When the user accepts the text or selects and option */
  onAccept: (optionSelected: string) => void;
  /** When the dialog closes */
  onClose: (optionSelected: string) => void;
}
