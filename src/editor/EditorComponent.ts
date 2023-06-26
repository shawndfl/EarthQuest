import { IEditor } from './IEditor';

/**
 * A base class that allows everything to have access to the editor
 */
export abstract class EditorComponent {
  public get editor(): IEditor {
    return this._editor;
  }

  constructor(private _editor: IEditor) {}
}
