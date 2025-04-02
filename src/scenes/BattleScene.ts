import { SceneComponent } from '../components/SceneComponent';
import { Engine } from '../core/Engine';
import { InputState } from '../core/InputHandler';
import { ILevelData } from '../environment/ILevelData';
import BG_DATA from '../assets/data/truncated_backgrounds.dat';
import * as BattleBackgroundEngine from '../battleBackgrounds/engine';
import BackgroundLayer from '../battleBackgrounds/rom/background_layer';
import ROM from '../battleBackgrounds/rom/rom';
import { BackgroundComponent } from '../components/BackgroundComponent';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export class BattleScene extends SceneComponent {
  private _backgroundEngine: any;
  private _backgroundSprite: BackgroundComponent;

  get type(): string {
    return this.constructor.name;
  }

  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(eng: Engine) {
    super(eng);
    this._backgroundSprite = new BackgroundComponent(this.eng);
  }

  initialize(): void {
    super.initialize();

    this._backgroundSprite.initialize();
    const backgroundData = new Uint8Array(
      Array.from(BG_DATA).map((x) => {
        return (x as any).charCodeAt(0);
      })
    );

    const rom = new ROM(backgroundData);
    const layer1 = new BackgroundLayer(271, rom);
    const layer2 = new BackgroundLayer(269, rom);
    const fps = 30;

    // Create animation engine
    this._backgroundEngine = new BattleBackgroundEngine.default([layer1, layer2], {
      fps: fps,
      aspectRatio: 0,
      frameSkip: 1,
      alpha: [0.3, 0.3],
      canvas: this.eng.canvasController.canvas2D,
    });
    this._backgroundEngine.initialize();
  }

  async loadBattle(level: ILevelData): Promise<void> {
    super.loadBattle(level);
    this.eng.viewManager.pushTarget();
    const x = 0;
    const y = this.eng.height * 0.25;
    this.eng.viewManager.setTarget(x, y);
    super.loadBattle(level);

    // setup the a random back ground
    this._backgroundEngine.layers[0].loadEntry(Math.floor(this.eng.random.mathRand() * 325));
    this._backgroundEngine.layers[1].loadEntry(Math.floor(this.eng.random.mathRand() * 325));

    this.eng.dialogManager.battleInfo.show();
    this.eng.dialogManager.battleInfo.setText('Fight!!');
    this.eng.dialogManager.showDialog({
      x: 20,
      y: 400,
      text: '',
      width: 300,
      height: 180,
      onClosing: (dialog) => {
        if (dialog.selectedOption == 'Attack') {
          this.pickTarget();
        } else if (dialog.selectedOption == 'Run Away') {
          // go back to the level
          this.eng.sceneManager.endBattle();
          return true;
          // this is used to pop out of a sub level like a house or store.
          //this.eng.sceneManager.requestNewLevel({ requestType: LevelRequest.previousLevel });
        }

        return false;
      },
      choices: ['Attack', 'Items', 'Run Away'],
    });
  }

  pickTarget(): void {
    this.eng.dialogManager.showDialog({
      x: 150,
      y: 120,
      text: 'Enemy1 or enemy 2',
      width: 400,
      height: 200,
      onClosing: (dialog) => {
        if (dialog.selectedOption == 'Attack') {
          console.debug('attacking!!');
          return false;
        } else {
        }

        return true;
      },
      choices: ['Attack', 'Run Away'],
    });
  }

  override endBattle(): void {
    //Do not use. This is not called from scene manager
    // use closeLevel()
  }

  /**
   * Handles user input. The logic goes through a chain of commands
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  override handleUserAction(state: InputState): boolean {
    return false;
  }

  override closeLevel(): void {
    this.eng.viewManager.popTarget();
    this.eng.dialogManager.battleInfo.hide();
  }

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  override update(dt: number) {
    // Clear the canvas before we start drawing on it.
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    super.update(dt);

    this._backgroundEngine.update(dt);
    this._backgroundSprite.setImage(this.eng.canvasController.canvas2D);
    this._backgroundSprite.update(dt);
  }

  resize(width: number, height: number) {}
}
