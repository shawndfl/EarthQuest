import type { System, World } from '../ecs/World';
import { MovementInput } from '../components/MovementInput';

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export class KeyboardInputSystem implements System {
  private readonly pressed = new Set<string>();

  constructor(target: Window = window) {
    target.addEventListener('keydown', event => {
      if (!ARROW_KEYS.has(event.key)) return;
      event.preventDefault();
      this.pressed.add(event.key);
    });
    target.addEventListener('keyup', event => this.pressed.delete(event.key));
    target.addEventListener('blur', () => this.pressed.clear());
  }

  update(world: World): void {
    const horizontal = Number(this.pressed.has('ArrowRight')) - Number(this.pressed.has('ArrowLeft'));
    const vertical = Number(this.pressed.has('ArrowUp')) - Number(this.pressed.has('ArrowDown'));
    for (const [, input] of world.query(MovementInput)) {
      input.horizontal = horizontal;
      input.vertical = vertical;
    }
  }
}
