import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

export class Editor extends Component {
  constructor(eng: Engine, readonly parentContainer: HTMLElement) {
    super(eng);
    this.buildHtml();
  }

  buildHtml() {}
}
