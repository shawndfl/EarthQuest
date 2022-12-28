import { TextManager } from '../systems/TextManager';
import { FpsController } from '../core/FpsController';
import { Texture } from '../core/Texture';
import grassImage from '../assets/grass.png';
import CharacterImage from '../assets/characters.png';
import CharacterData from '../assets/characters.json';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { Ground } from '../environment/Ground';
import { PlayerController } from './PlayerController';
import { Engine } from '../core/Engine';
import { Component } from './Component';
import { UserAction } from '../core/UserAction';
import { CreateSimpleAnimationClip } from '../utilities/CreateSimpleAnimationClip';
import { DialogMenu } from '../menus/DialogMenu';
import { SpriteDebugger } from './SpriteDebugger';

/**
 * Sample scene
 */
export class Scene extends Component {
  readonly fps: FpsController;
  readonly spriteSheetTexture: Texture;
  readonly ground: Ground;
  readonly player: PlayerController;
  readonly textManager: TextManager;
  readonly dialog: DialogMenu;

  readonly spriteDebugger: SpriteDebugger;

  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl The render context
   */
  constructor(eng: Engine) {
    super(eng);

    this.fps = new FpsController(eng);

    this.spriteSheetTexture = new Texture(this.gl);
    this.textManager = new TextManager(eng);
    this.ground = new Ground(eng);

    this.player = new PlayerController(eng);
    this.spriteDebugger = new SpriteDebugger(eng);
    this.dialog = new DialogMenu(eng);
  }

  /**
   * Sets up the scene
   */
  async initialize() {
    console.log('init scene');

    CreateSimpleAnimationClip.create(CharacterData);

    // Browsers copy pixels from the loaded image in top-to-bottom order —
    // from the top-left corner; but WebGL wants the pixels in bottom-to-top
    // order — starting from the bottom-left corner. So in order to prevent
    // the resulting image texture from having the wrong orientation when
    // rendered, we need to make the following call, to cause the pixels to
    // be flipped into the bottom-to-top order that WebGL expects.
    // See jameshfisher.com/2020/10/22/why-is-my-webgl-texture-upside-down
    // NOTE, this must be done before any textures are loaded
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    await this.spriteSheetTexture.loadImage(CharacterImage);
    this.ground.initialize();
    this.player.initialize(this.spriteSheetTexture, CharacterData);
    this.spriteDebugger.initialize(this.spriteSheetTexture, CharacterData);
    await this.dialog.initialize();

    await this.textManager.initialize(FontImage, FontData);
    this.textManager.setTextBlock({
      id: 'welcomeText',
      text: 'Earth Quest',
      position: new vec2([-800, 600]),
      color: new vec4([1, 0, 0, 0.5]),
      depth: 0,
      scale: 0.5,
    });
  }

  /**
   * Handles user input. The logic goes through a chain of commands
   *    1) Main menu
   *    2) pause menu
   *    3) battle menu
   *    4) dialog menu
   *    5) player in the environment
   * @param action the action from keyboard or gamepad
   * @returns True if the action was handled else false
   */
  handleUserAction(action: UserAction): boolean {
    //console.debug('user action ', action);
    // handle main menu, pause menu, battles menu, dialog menu, environment

    return (
      this.dialog.handleUserAction(action) ||
      this.spriteDebugger.handleUserAction(action) ||
      this.player.handleUserAction(action)
    );
  }

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {
    this.fps.update(dt);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.clearColor(0.3, 0.3, 0.3, 1.0); // Clear to black, fully opaque
    this.gl.clearDepth(1.0); // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // update the texture manager
    this.textManager.update(dt);

    this.ground.update(dt);

    this.player.update(dt);

    this.spriteDebugger.update(dt);

    this.dialog.update(dt);
  }

  resize(width: number, height: number) {}

  dispose() {
    console.log('dispose');
  }
}
