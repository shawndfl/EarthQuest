import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

export class CollisionManager extends Component {
  constructor(eng: Engine) {
    super(eng);
  }

  initialize() {}

  update(dt: number) {}
}
