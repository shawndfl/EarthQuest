import { Engine } from '../core/Engine';

/**
 * A component is something that is part of the game engine and has a reference
 * to the game engine and all the subsystems like text managers, collision and raise events.
 */
export class Component {
  constructor(readonly engine: Engine) {}
}
