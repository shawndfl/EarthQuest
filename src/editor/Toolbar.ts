import '../css/ToolbarView.scss';
import { EditorComponent } from './EditorComponent';
import { IEditor } from './IEditor';
import { ToolbarOptions } from './ToolbarOptions';

/**
 * The tool bar controller. This class manages general state for the editor
 * and allows the developer to add buttons.
 */
export class Toolbar extends EditorComponent {
  private container: HTMLElement;
  selectedTool: ToolbarOptions;
  private buttons: Map<string, HTMLElement>;

  constructor(editor: IEditor) {
    super(editor);
    this.buttons = new Map<string, HTMLElement>();
  }

  buildHtml(): HTMLElement {
    this.container = document.createElement('div');
    this.container.classList.add('editor-toolbar');

    return this.container;
  }

  getButton(id: string): HTMLElement {
    return this.buttons.get(id);
  }

  /**
   * Adds a button
   * @param id
   * @param icon
   * @param text
   * @param click
   */
  addButton(
    id: string,
    icon: string,
    text: string,
    click: (e: MouseEvent) => void
  ): HTMLElement {
    const btn = document.createElement('button');
    btn.dataset.id = id;
    btn.classList.add('btn');
    btn.addEventListener('click', (e: MouseEvent) => {
      if (click) {
        click(e);
      }
    });

    const span = document.createElement('span');

    const img = document.createElement('img');
    img.src = icon;

    const textDiv = document.createElement('div');
    textDiv.innerHTML = text;

    span.append(img, textDiv);
    btn.append(span);
    this.container.append(btn);

    // save the button
    this.buttons.set(id, btn);
    return btn;
  }

  /**
   * Set the button as active
   * @param element
   * @param active
   */
  setActive(element: HTMLElement, active: boolean) {
    if (active) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  }
}
