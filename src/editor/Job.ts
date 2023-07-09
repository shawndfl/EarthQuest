import { EditorComponent } from './EditorComponent';

export abstract class Job extends EditorComponent {
  abstract redo(): void;
  abstract execute(): void;
  abstract undo(): void;
}
