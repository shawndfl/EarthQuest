import { Component } from '../components/Component';
import { Engine } from '../core/Engine';

/**
 * This is the main class that manages game state
 */
export class GameManager extends Component {
  constructor(eng: Engine) {
    super(eng);
  }

  initialize() {}
}
