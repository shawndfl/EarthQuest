import { Engine } from '../core/Engine';
import { IEditor } from './IEditor';

/**
 * A base class that allows everything to have access to the editor
 */
export abstract class EditorComponent {

  public get eng(): Engine {
    return this.editor.eng;
  }
  public get editor(): IEditor {
    return this._editor;
  }

  constructor(private _editor: IEditor) {}
}
