import { Component } from '../core/Component';
import { Engine } from '../core/Engine';
import vec2 from '../math/vec2';

/**
 * User input action.
 */
export enum UserAction {
  None = 0x0000,
  Right = 0x0001,
  Left = 0x0002,
  Up = 0x0004,
  Down = 0x0008,

  UpRight = Right | Up,
  UpLeft = Left | Up,
  DownRight = Right | Down,
  DownLeft = Left | Down,

  Start = 0x0010,
  Select = 0x0020,
  A = 0x0040,
  B = 0x0080,
}

/**
 * Used to pass input state to other classes.
 */
export class InputState {
  /**
   * logical buttons
   */
  buttonsDown: UserAction;

  /**
   * The buttons that were just released
   */
  buttonsReleased: UserAction;

  /**
   * inputDown mouse or touch
   */
  inputDown: [boolean, boolean];

  /**
   * Only true for one frame when the mouse is released or touch point lifted
   */
  inputReleased: boolean;

  /**
   * Capture two touch points if they are there.
   */
  touchPoint: [vec2, vec2];

  /**
   * how many touch points are there.
   */
  touchCount: number;
}

export interface InputMappings {
  /**
   * Mapping for the keyboard
   */
  keyboardMapping: string[];

  /**
   * Mappint for the game pads
   */
  gamePadMapping: Map<string, number[]>;
}

/**
 * Translates keyboard and gamepad events to game actions
 */
export class InputManager extends Component {
  hasGamePad: boolean;

  /**
   * What logical button index are we calibrating.
   */
  activeButtonIndex: number;

  /**
   * Name of the game pad
   */
  gamePadType: string;

  /**
   * logical buttons
   */
  private buttonsDown: UserAction;

  /**
   * The buttons that were just released
   */
  private buttonsReleased: UserAction;

  /**
   * The first two touch points or mouse left botton and mouse left+shift mouse button
   */
  private inputDown: [boolean, boolean];

  /**
   * Only true for one frame when the mouse is released or touch point lifted
   */
  private inputReleased: boolean;

  /**
   * Capture two touch points if they are there.
   */
  private touchPoint: [vec2, vec2];

  /**
   * how many touch points are there.
   */
  private touchCount: number;

  constructor(eng: Engine) {
    super(eng);

    this.buttonsDown = UserAction.None;
    this.buttonsReleased = UserAction.None;
    this.hasGamePad = 'getGamepads' in navigator;
    console.debug('initializing input:');

    this.touchPoint = [vec2.zero, vec2.zero];
    this.touchCount = 0;

    window.addEventListener('keydown', (e) => {
      this.keydown(e);
    });
    window.addEventListener('keyup', (e) => {
      this.keyup(e);
    });

    if (!this.isTouchEnabled()) {
      console.debug(' mouse enabled');
      window.addEventListener('mousedown', (e) => {
        if (e.shiftKey) {
          this.inputDown = [false, true];
        } else {
          this.inputDown = [true, false];
        }
        this.inputReleased = false;
        this.touchPoint[0].x = e.offsetX;
        this.touchPoint[0].y = e.offsetY;
        this.touchCount = 1;
      });
      window.addEventListener('mouseup', (e) => {
        this.inputDown = [false, false];
        this.inputReleased = true;
        this.touchPoint[0].x = e.offsetX;
        this.touchPoint[0].y = e.offsetY;
        this.touchCount = 1;
      });
    } else {
      console.debug(' touch enabled');
      window.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0 && e.touches[0].target === eng.gl.canvas) {
          this.inputDown = [e.touches.item(0) ? true : false, e.touches.item(1) ? true : false];
          this.inputReleased = false;

          const t = e.touches[0].target as HTMLCanvasElement;
          this.touchPoint[0].x = e.touches[0].pageX - t.clientTop;
          this.touchPoint[0].y = e.touches[0].screenY;
          if (e.touches.length > 1) {
            this.touchPoint[1].x = e.touches[1].pageX - t.clientTop;
            this.touchPoint[1].y = e.touches[1].screenY;
          }
          this.touchCount = e.touches.length;
        }
      });
    }
  }

  isReleased(btn: UserAction) {
    return (this.buttonsReleased & btn) > 0;
  }

  isDown(btn: UserAction) {
    return (this.buttonsDown & btn) > 0;
  }

  movingDirection(scale?: number): vec2 {
    if (!scale) {
      scale = 1;
    }
    const movingLeft = (this.buttonsDown & UserAction.Left) > 0;
    const movingRight = (this.buttonsDown & UserAction.Right) > 0;
    const movingUp = (this.buttonsDown & UserAction.Up) > 0;
    const movingDown = (this.buttonsDown & UserAction.Down) > 0;

    const movingX = movingLeft ? -1 : movingRight ? 1 : 0;
    const movingY = movingUp ? -1 : movingDown ? 1 : 0;
    return new vec2(movingX, movingY).normalize().scale(scale);
  }

  /**
   * Called by the engine to initialize the input state
   * @param dt
   */
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
      gamepad.buttons.forEach((btn) => {
        btn.pressed;
      });
    }
  }

  /**
   * Reset release state. Used by the Engine
   * @param dt
   */
  postUpdate(dt: number) {
    // reset press actions
    this.buttonsReleased = UserAction.None;
    this.inputReleased = false;
  }

  isTouchEnabled() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private keydown(e: KeyboardEvent) {
    if (e.key == 'ArrowRight') {
      this.buttonsDown = this.buttonsDown | UserAction.Right;
    }

    if (e.key == 'ArrowLeft') {
      this.buttonsDown = this.buttonsDown | UserAction.Left;
    }

    if (e.key == 'ArrowUp') {
      this.buttonsDown = this.buttonsDown | UserAction.Up;
    }

    if (e.key == 'ArrowDown') {
      this.buttonsDown = this.buttonsDown | UserAction.Down;
    }

    if (e.key == ' ') {
      this.buttonsDown = this.buttonsDown | UserAction.A;
    }

    if (e.key == 'b') {
      this.buttonsDown = this.buttonsDown | UserAction.B;
    }

    if (e.key == 'Enter') {
      this.buttonsDown = this.buttonsDown | UserAction.Start;
    }

    if (e.key == 'esc') {
      this.buttonsDown = this.buttonsDown | UserAction.Select;
    }
  }

  private keyup(e: KeyboardEvent) {
    if (e.key == 'ArrowRight') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Right;
      this.buttonsReleased = this.buttonsReleased | UserAction.Right;
    }

    if (e.key == 'ArrowLeft') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Left;
      this.buttonsReleased = this.buttonsReleased | UserAction.Left;
    }

    if (e.key == 'ArrowUp') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Up;
      this.buttonsReleased = this.buttonsReleased | UserAction.Up;
    }

    if (e.key == 'ArrowDown') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Down;
      this.buttonsReleased = this.buttonsReleased | UserAction.Down;
    }

    if (e.key == ' ') {
      this.buttonsDown = this.buttonsDown & ~UserAction.A;
      this.buttonsReleased = this.buttonsReleased | UserAction.A;
    }

    if (e.key == 'b') {
      this.buttonsDown = this.buttonsDown & ~UserAction.B;
      this.buttonsReleased = this.buttonsReleased | UserAction.B;
    }

    if (e.key == 'Enter') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Start;
      this.buttonsReleased = this.buttonsReleased | UserAction.Start;
    }

    if (e.key == 'esc') {
      this.buttonsDown = this.buttonsDown & ~UserAction.Select;
      this.buttonsReleased = this.buttonsReleased | UserAction.Select;
    }
  }

  private connectGamepad(e: GamepadEvent) {
    console.log('✅ 🎮 A gamepad was connected:', e.gamepad);
  }

  private disconnectGamepad(e: GamepadEvent) {
    console.debug('Gamepad disconnected', e.gamepad);
  }

  private resetInput() {
    this.buttonsDown = UserAction.None;
    this.buttonsReleased = UserAction.None;

    this.hasGamePad = 'getGamepads' in navigator;
    if (this.hasGamePad) {
      console.debug(' gamepad supported');
      window.removeEventListener('gamepadconnected', this.connectGamepad.bind(this));
      window.removeEventListener('gamepaddisconnected', this.disconnectGamepad.bind(this));

      window.addEventListener('gamepadconnected', this.connectGamepad.bind(this));
      window.addEventListener('gamepaddisconnected', this.disconnectGamepad.bind(this));
    } else {
      console.warn('gamepad not supported!');
    }
  }

  closeLevel(): void {
    this.resetInput();
  }
}
