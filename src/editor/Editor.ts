import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

export class Editor extends Component {
  private _parent: HTMLElement;

  constructor(eng: Engine) {
    super(eng);
  }

  initialize(parentContainer: HTMLElement) {
    this._parent = parentContainer;
    this.buildHtml();
  }

  buildHtml() {}
}
