import { Component } from '../components/Component';
import { Engine } from './Engine';

/**
 * Translates keyboard and gamepad events to game actions
 */
export class InputHandler extends Component {
  hasGamePad: boolean;

  constructor(eng: Engine) {
    super(eng);

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
      this.translateKeyboard(e);
    });
  }

  translateKeyboard(e: KeyboardEvent) {
    console.log('keyboard ', e);
  }

  connectGamepad(e: GamepadEvent) {
    console.log('✅ 🎮 A gamepad was connected:', e.gamepad);
  }

  disconnectGamepad(e: GamepadEvent) {
    console.debug('Gamepad disconnected', e.gamepad);
  }
}
