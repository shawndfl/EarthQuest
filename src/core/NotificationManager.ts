import { EditorComponent } from '../editor/EditorComponent';
import { IEditor } from '../editor/IEditor';

/**
 * Manages notifications
 */
export class NotificationManager extends EditorComponent {
  listeners: Map<string, ((data: any) => void)[]>;
  constructor(editor: IEditor) {
    super(editor);
    this.listeners = new Map<string, ((data: any) => void)[]>();
  }

  subscribe(event: string, handler: (data: any) => void) {
    let list = this.listeners.get(event);
    if (!list) {
      this.listeners.set(event, [handler]);
    } else {
      list.push(handler);
    }
  }

  post(event: string, data: any) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((handler) => handler(data));
    }
  }

  unsubscribe(handler: (data: any) => void): void {
    this.listeners.forEach((events, key) => {
      this.listeners.set(
        key,
        events.filter((h) => {
          const same = h !== handler;
          return same;
        })
      );
    });
  }

  dumpSubscriptions() {
    this.listeners.forEach((events, key) => {
      console.debug('event: ' + key);
      events.forEach((val) => console.debug('  event:', val));

      console.debug('end events');
    });
  }
}
