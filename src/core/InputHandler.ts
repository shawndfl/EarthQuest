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
    //console.log('keyboard down', e);
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
      this.action = this.action | UserAction.Down;
    }

    if (e.key == ' ') {
      this.action = this.action | UserAction.Action;
    }

    if (e.key == 'Enter') {
      this.action = this.action | UserAction.Menu;
    }

    if (e.key == 'Backspace') {
      this.action = this.action | UserAction.Cancel;
    }
  }

  keyup(e: KeyboardEvent) {
    //console.log('keyboard up ', e);
    if (e.key == 'ArrowRight') {
      this.action = this.action & ~UserAction.Right;
      this.action = this.action | UserAction.RightPressed;
    }

    if (e.key == 'ArrowLeft') {
      this.action = this.action & ~UserAction.Left;
      this.action = this.action | UserAction.LeftPressed;
    }

    if (e.key == 'ArrowUp') {
      this.action = this.action & ~UserAction.Up;
      this.action = this.action | UserAction.UpPressed;
    }

    if (e.key == 'ArrowDown') {
      this.action = this.action & ~UserAction.Down;
      this.action = this.action | UserAction.DownPressed;
    }

    if (e.key == ' ') {
      this.action = this.action & ~UserAction.Action;
      this.action = this.action | UserAction.ActionPressed;
    }

    if (e.key == 'Enter') {
      this.action = this.action & ~UserAction.Menu;
      this.action = this.action | UserAction.MenuPressed;
    }

    if (e.key == 'Backspace') {
      this.action = this.action & ~UserAction.Cancel;
      this.action = this.action | UserAction.CancelPressed;
    }
  }

  preUpdate(dt: number) {
    // Always call `navigator.getGamepads()` inside of
    // the game loop, not outside.
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      // Disregard empty slots.
      if (!gamepad) {
        continue;
      }

      //TODO capture state from game pads
    }
  }

  postUpdate(dt: number) {
    // reset press actions
    this.action = this.action & ~UserAction.LeftPressed;
    this.action = this.action & ~UserAction.RightPressed;
    this.action = this.action & ~UserAction.UpPressed;
    this.action = this.action & ~UserAction.DownPressed;

    this.action = this.action & ~UserAction.ActionPressed;
    this.action = this.action & ~UserAction.CancelPressed;
    this.action = this.action & ~UserAction.MenuPressed;
  }

  connectGamepad(e: GamepadEvent) {
    console.log('✅ 🎮 A gamepad was connected:', e.gamepad);
  }

  disconnectGamepad(e: GamepadEvent) {
    console.debug('Gamepad disconnected', e.gamepad);
  }
}
