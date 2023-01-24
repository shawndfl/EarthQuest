import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import { IDialogParams } from '../menus/IDialogParams';

/**
 * This class is used to build the visual dialog box
 */
export class DialogBuilder extends Component {
  readonly continueIconX = 350;
  readonly continueIconY = 75;
  readonly tileWidth = 8;
  readonly tileHeight = 8;
  readonly iconScale = 3;
  readonly minWidth = 20;
  readonly minHeight = 20;
  readonly textHeight = 50;
  readonly textWidth = 300;
  readonly textOffsetX = 20;
  readonly textOffsetY = 50;

  constructor(eng: Engine) {
    super(eng);
  }
  /**
   * Hides all the dialog box
   * @param dialogId
   */
  hideDialog(dialogId: string, spriteController: SpritBatchController) {
    spriteController.removeSprite(dialogId + 'menu.left.top');
    spriteController.removeSprite(dialogId + 'menu.right.top');
    spriteController.removeSprite(dialogId + 'menu.right.bottom');
    spriteController.removeSprite(dialogId + 'menu.left.bottom');
    spriteController.removeSprite(dialogId + 'menu.center.top');
    spriteController.removeSprite(dialogId + 'menu.center.bottom');
    spriteController.removeSprite(dialogId + 'menu.left.middle');
    spriteController.removeSprite(dialogId + 'menu.right.middle');
    spriteController.removeSprite(dialogId + 'menu.center.middle');

    spriteController.commitToBuffer();
  }

  /**
   * Creates and positions a dialog box
   * @param dialogId
   * @param spriteController
   * @param p
   */
  buildDialog(dialogId: string, spriteController: SpritBatchController, p: IDialogParams) {
    // inner y is like the bottom corner of the text filed.
    // p.yPos is pixels from the top of the screen
    const innerTopLeft = new vec2(p.x + this.tileWidth * this.iconScale, p.y + this.tileWidth * this.iconScale);
    const innerTopRight = new vec2(
      p.x + (p.width - this.tileWidth * this.iconScale),
      p.y + this.tileHeight * this.iconScale
    );
    const innerBottomRight = new vec2(
      p.x + (p.width - this.tileWidth * this.iconScale),
      p.height + p.y - this.tileHeight * this.iconScale
    );
    const innerBottomLeft = new vec2(
      p.x + this.tileWidth * this.iconScale,
      p.height + p.y - this.tileHeight * this.iconScale
    );

    const bottomRight = new vec2(p.x + (p.width - this.tileWidth * this.iconScale), p.height + p.y);
    const bottomLeft = new vec2(p.x + this.tileWidth * this.iconScale, p.height + p.y);

    // top left corner
    spriteController.activeSprite(dialogId + 'menu.left.top');
    spriteController.scale(this.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(p.x, this.eng.height - innerTopLeft.y, -1);
    spriteController.setSprite('menu.left.top');

    // top right corner
    spriteController.activeSprite(dialogId + 'menu.right.top');
    spriteController.scale(this.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopRight.x, this.eng.height - innerTopRight.y, -1);
    spriteController.setSprite('menu.right.top');

    // bottom right corner
    spriteController.activeSprite(dialogId + 'menu.right.bottom');
    spriteController.scale(this.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopRight.x, this.eng.height - bottomRight.y, -1);
    spriteController.setSprite('menu.right.bottom');

    // bottom left corner
    spriteController.activeSprite(dialogId + 'menu.left.bottom');
    spriteController.scale(this.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(p.x, this.eng.height - bottomLeft.y, -1);
    spriteController.setSprite('menu.left.bottom');

    // position the edges
    const topEdgeScale = (innerTopRight.x - innerTopLeft.x) / this.tileWidth;
    const rightEdgeScale = (innerBottomRight.y - innerTopRight.y) / this.tileHeight;

    // top edge
    spriteController.activeSprite(dialogId + 'menu.center.top');
    spriteController.scale({ x: topEdgeScale, y: this.iconScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopLeft.x, this.eng.height - innerTopRight.y, -1);
    spriteController.setSprite('menu.center.top');

    // bottom edge
    spriteController.activeSprite(dialogId + 'menu.center.bottom');
    spriteController.scale({ x: topEdgeScale, y: this.iconScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopLeft.x, this.eng.height - bottomRight.y, -1);
    spriteController.setSprite('menu.center.bottom');

    // left edge
    spriteController.activeSprite(dialogId + 'menu.left.middle');
    spriteController.scale({ x: this.iconScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(p.x, this.eng.height - innerBottomRight.y, -1);
    spriteController.setSprite('menu.left.middle');

    // right edge
    spriteController.activeSprite(dialogId + 'menu.right.middle');
    spriteController.scale({ x: this.iconScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopRight.x, this.eng.height - innerBottomRight.y, -1);
    spriteController.setSprite('menu.right.middle');

    // center
    spriteController.activeSprite(dialogId + 'menu.center.middle');
    spriteController.scale({ x: topEdgeScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopLeft.x, this.eng.height - innerBottomRight.y, -1);
    spriteController.setSprite('menu.center.middle');
  }
}
