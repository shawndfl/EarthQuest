import { IEditor } from '../src/editor/IEditor';
import { NotificationManager } from '../src/editor/NotificationManager';

test('notification', () => {
  const manger = new NotificationManager({} as any as IEditor);
  let eventRaised = false;
  manger.subscribe('TestEvent', (data) => {
    console.debug('Got event ' + data.name);
    expect(data?.name).toBe('hello');
    eventRaised = true;
  });
  manger.post('TestEvent', { name: 'hello' });

  expect(eventRaised).toBe(true);
});

test('unsubscribe', () => {
  const manger = new NotificationManager({} as any as IEditor);
  let callCount = 0;
  const event = (data: any) => {
    console.debug('Got event ' + data.name);
    expect(data?.name).toBe('hello');
    callCount++;
  };
  manger.subscribe('TestEvent', event);

  // raise the event
  manger.post('TestEvent', { name: 'hello' });
  expect(callCount).toBe(1);

  // unsubscribe
  manger.unsubscribe(event);

  // call the event again.
  manger.post('TestEvent', { name: 'hello' });
  expect(callCount).toBe(1);
});

test('multiple Events', () => {
  const manger = new NotificationManager({} as any as IEditor);
  let callCount1 = 0;
  let callCount2 = 0;
  const event = (data: any) => {
    console.debug('Got event ' + data.name);
    expect(data?.name).toBe('hello');
    callCount1++;
  };
  const event2 = (data: any) => {
    console.debug('Got event2 ' + data.name);
    expect(data?.name).toBe('hello');
    callCount2++;
  };
  manger.subscribe('TestEvent', event);
  manger.subscribe('TestEvent', event2);

  // raise the event
  manger.post('TestEvent', { name: 'hello' });
  expect(callCount1).toBe(1);
  expect(callCount2).toBe(1);

  // unsubscribe
  manger.unsubscribe(event);

  // call the event again.
  manger.post('TestEvent', { name: 'hello' });
  expect(callCount1).toBe(1);
  expect(callCount2).toBe(2);
});
