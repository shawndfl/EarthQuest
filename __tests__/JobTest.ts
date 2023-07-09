import { Job } from '../src/editor/Job';
import { JobManager } from '../src/editor/JobManager';

interface SystemTestState {
  index: number;
}

class TestJob extends Job {
  private lastState: number;

  constructor(private _index: number, private systemState: SystemTestState) {
    super(null);
  }
  redo(): void {
    this.systemState.index = this._index;
  }
  execute(): void {
    this.lastState = this.systemState.index;

    this.systemState.index = this._index;
  }
  undo(): void {
    this.systemState.index = this.lastState;
  }
}

test('CreateJob', () => {
  const jobManager = new JobManager({} as any);
  const state: SystemTestState = { index: 0 };
  expect(state.index).toBe(0);

  jobManager.execute(new TestJob(1, state));
  expect(state.index).toBe(1);

  jobManager.execute(new TestJob(2, state));
  expect(state.index).toBe(2);

  jobManager.undo();
  expect(state.index).toBe(1);

  jobManager.undo();
  expect(state.index).toBe(0);

  jobManager.undo();
  expect(state.index).toBe(0);

  jobManager.redo();
  expect(state.index).toBe(1);

  jobManager.redo();
  expect(state.index).toBe(2);

  jobManager.redo();
  expect(state.index).toBe(2);
});

test('Undo Job Limit', () => {
  const jobManager = new JobManager({} as any, 3);
  const state: SystemTestState = { index: 0 };
  expect(state.index).toBe(0);

  jobManager.execute(new TestJob(1, state));
  expect(state.index).toBe(1);

  jobManager.execute(new TestJob(2, state));
  expect(state.index).toBe(2);

  jobManager.execute(new TestJob(3, state));
  expect(state.index).toBe(3);

  jobManager.execute(new TestJob(4, state));
  expect(state.index).toBe(4);

  jobManager.undo();
  expect(state.index).toBe(3);

  jobManager.undo();
  expect(state.index).toBe(2);

  jobManager.undo();
  expect(state.index).toBe(1);

  jobManager.undo();
  expect(state.index).toBe(1);
});

test('Redo Job Limit', () => {
  const jobManager = new JobManager({} as any, 3);
  const state: SystemTestState = { index: 0 };
  expect(state.index).toBe(0);

  jobManager.execute(new TestJob(1, state));
  expect(state.index).toBe(1);

  jobManager.execute(new TestJob(2, state));
  expect(state.index).toBe(2);

  jobManager.execute(new TestJob(3, state));
  expect(state.index).toBe(3);

  jobManager.execute(new TestJob(4, state));
  expect(state.index).toBe(4);

  jobManager.undo();
  expect(state.index).toBe(3);

  jobManager.undo();
  expect(state.index).toBe(2);

  jobManager.undo();
  expect(state.index).toBe(1);

  jobManager.undo();
  expect(state.index).toBe(1);

  jobManager.redo();
  expect(state.index).toBe(2);

  jobManager.redo();
  expect(state.index).toBe(3);

  jobManager.redo();
  expect(state.index).toBe(4);

  jobManager.redo();
  expect(state.index).toBe(4);
});
