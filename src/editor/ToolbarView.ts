import '../css/ToolbarView.css';

export class ToolbarView {
  container: HTMLElement;

  constructor() {}

  buildHtml(): HTMLElement {
    this.container = document.createElement('div');
    this.container.classList.add('editor-toolbar');

    return this.container;
  }

  addButton(id: string, text: string, click: () => void) {
    const btn = document.createElement('div');
    btn.dataset.id = id;
    btn.classList.add('btn');
    btn.innerHTML = text;
    btn.addEventListener('click', () => {
      if (click) {
        click();
      }
    });
    this.container.append(btn);
  }
}
