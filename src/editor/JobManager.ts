import { EditorComponent } from './EditorComponent';
import { IEditor } from './IEditor';
import { Job } from './Job';

/**
 * Manages an undo and redo stack for Jobs
 */
export class JobManager extends EditorComponent {
  undoStack: Job[];
  redoStack: Job[];

  get maxUndoJobs(): number {
    return this._maxUndoJobs;
  }

  constructor(editor: IEditor, private _maxUndoJobs: number = 10) {
    super(editor);
    this.undoStack = [];
    this.redoStack = [];
  }

  execute(job: Job): Job {
    job.execute();

    // limit the size of the stack
    if (this.undoStack.length >= this.maxUndoJobs) {
      this.undoStack.shift();
    }
    this.undoStack.push(job);
    return job;
  }

  undo(): Job {
    const job = this.undoStack.pop();
    if (job) {
      job.undo();

      // limit the size of the stack
      if (this.redoStack.length >= this.maxUndoJobs) {
        this.redoStack.shift();
      }

      this.redoStack.push(job);
    }
    return job;
  }

  redo(): Job {
    const job = this.redoStack.pop();
    if (job) {
      job.redo();

      // limit the size of the stack
      if (this.undoStack.length >= this.maxUndoJobs) {
        this.undoStack.shift();
      }
      this.undoStack.push(job);
    }
    return job;
  }
}
