import { TileHelper } from '../utilities/TileHelper';
import { EditorCanvas } from './EditorCanvas';
import { JobManager } from './JobManager';
import { MenuBar } from './MenuBar';
import { StatusBar } from './StatusBar';
import { TileBrowser } from './TileBrowser';
import { Toolbar } from './Toolbar';

export interface IEditor {
  readonly toolbarView: Toolbar;
  readonly tileBrowser: TileBrowser;
  readonly editorCanvas: EditorCanvas;
  readonly menuBar: MenuBar;
  readonly statusBar: StatusBar;
  readonly jobManager: JobManager;
  readonly tileHelper: TileHelper;
}
