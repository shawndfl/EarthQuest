export class JsonEditorDialog {
  protected title: string;
  protected container: HTMLElement;

  constructor() {}

  buildHtml(): HTMLElement {
    const container = document.createElement('div');
    this.container = container;
    container.classList.add('dialog-container');

    return container;
  }
}
