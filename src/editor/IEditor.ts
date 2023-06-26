import { EditorCanvas } from './EditorCanvas';
import { TileBrowser } from './TileBrowser';
import { ToolbarView } from './ToolbarView';

export interface IEditor {
  readonly toolbarView: ToolbarView;
  readonly tileBrowser: TileBrowser;
  readonly editorCanvas: EditorCanvas;
}
