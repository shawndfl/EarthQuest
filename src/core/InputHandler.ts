import { Component } from '../components/Component';
import { Engine } from './Engine';
import { UserAction } from './UserAction';
/**
 * Translates keyboard and gamepad events to game actions
 */
export class InputHandler extends Component {
  hasGamePad: boolean;
  action: number;

  constructor(eng: Engine) {
    super(eng);
    this.action = UserAction.None;
    this.hasGamePad = 'getGamepads' in navigator;

    if (this.hasGamePad) {
      console.debug('Gamepad supported');

      window.addEventListener('gamepadconnected', (e) => {
        this.connectGamepad(e);
      });

      window.addEventListener('gamepaddisconnected', (e) => {
        this.disconnectGamepad(e);
      });
    } else {
      console.warn('gamepad not supported!');
    }

    window.addEventListener('keydown', (e) => {
      this.keydown(e);
    });
    window.addEventListener('keyup', (e) => {
      this.keyup(e);
    });
  }

  keydown(e: KeyboardEvent) {
    console.log('keyboard down', e);

    if (e.key == 'ArrowRight') {
      this.action = this.action | UserAction.Right;
    }

    if (e.key == 'ArrowLeft') {
      this.action = this.action | UserAction.Left;
    }

    if (e.key == 'ArrowUp') {
      this.action = this.action | UserAction.Up;
    }

    if (e.key == 'ArrowDown') {
      this.action = this.action | UserAction.Up;
    }
  }

  keyup(e: KeyboardEvent) {
    console.log('keyboard up ', e);
    if (e.key == 'ArrowRight') {
      this.action = this.action & ~UserAction.Right;
    }

    if (e.key == 'ArrowLeft') {
      this.action = this.action & ~UserAction.Left;
    }

    if (e.key == 'ArrowUp') {
      this.action = this.action & ~UserAction.Up;
    }

    if (e.key == 'ArrowDown') {
      this.action = this.action & ~UserAction.Up;
    }
  }

  connectGamepad(e: GamepadEvent) {
    console.log('✅ 🎮 A gamepad was connected:', e.gamepad);
  }

  disconnectGamepad(e: GamepadEvent) {
    console.debug('Gamepad disconnected', e.gamepad);
  }
}
