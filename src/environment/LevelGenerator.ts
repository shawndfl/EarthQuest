import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

export class LevelGenerator extends Component {
  constructor(eng: Engine) {
    super(eng);
  }

  Generate(options: { width: number; length: number; height: number }) {
    for (let i = 0; i < 100; i++) {
      console.debug(this.eng.random.rand());
    }
  }
}
