import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import { IDialogParams } from '../menus/IDialogParams';

/**
 * This class is used to build the visual dialog box
 */
export class DialogBuilder {
  /**
   * Hides all the dialog box
   * @param dialogId
   */
  static hideDialog(dialogId: string, spriteController: SpritBatchController) {
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
  static buildDialog(dialogId: string, spriteController: SpritBatchController, p: IDialogParams) {
    // inner y is like the bottom corner of the text filed.
    // p.yPos is pixels from the top of the screen
    const innerTopLeft = new vec2(p.xPos + p.tileWidth * p.iconScale, p.yPos + p.tileHeight * p.iconScale);
    const innerTopRight = new vec2(p.xPos + (p.width - p.tileWidth * p.iconScale), p.yPos + p.tileHeight * p.iconScale);
    const innerBottomRight = new vec2(
      p.xPos + (p.width - p.tileWidth * p.iconScale),
      p.height + p.yPos - p.tileHeight * p.iconScale
    );
    const innerBottomLeft = new vec2(
      p.xPos + p.tileWidth * p.iconScale,
      p.height + p.yPos - p.tileHeight * p.iconScale
    );

    const bottomRight = new vec2(p.xPos + (p.width - p.tileWidth * p.iconScale), p.height + p.yPos);
    const bottomLeft = new vec2(p.xPos + p.tileWidth * p.iconScale, p.height + p.yPos);

    // top left corner
    spriteController.activeSprite(dialogId + 'menu.left.top');
    spriteController.scale(p.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(p.xPos, p.eng.height - innerTopLeft.y, -1);
    spriteController.setSprite('menu.left.top');

    // top right corner
    spriteController.activeSprite(dialogId + 'menu.right.top');
    spriteController.scale(p.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopRight.x, p.eng.height - innerTopRight.y, -1);
    spriteController.setSprite('menu.right.top');

    // bottom right corner
    spriteController.activeSprite(dialogId + 'menu.right.bottom');
    spriteController.scale(p.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopRight.x, p.eng.height - bottomRight.y, -1);
    spriteController.setSprite('menu.right.bottom');

    // bottom left corner
    spriteController.activeSprite(dialogId + 'menu.left.bottom');
    spriteController.scale(p.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(p.xPos, p.eng.height - bottomLeft.y, -1);
    spriteController.setSprite('menu.left.bottom');

    // position the edges
    const topEdgeScale = (innerTopRight.x - innerTopLeft.x) / p.tileWidth;
    const rightEdgeScale = (innerBottomRight.y - innerTopRight.y) / p.tileHeight;

    // top edge
    spriteController.activeSprite(dialogId + 'menu.center.top');
    spriteController.scale({ x: topEdgeScale, y: p.iconScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopLeft.x, p.eng.height - innerTopRight.y, -1);
    spriteController.setSprite('menu.center.top');

    // bottom edge
    spriteController.activeSprite(dialogId + 'menu.center.bottom');
    spriteController.scale({ x: topEdgeScale, y: p.iconScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopLeft.x, p.eng.height - bottomRight.y, -1);
    spriteController.setSprite('menu.center.bottom');

    // left edge
    spriteController.activeSprite(dialogId + 'menu.left.middle');
    spriteController.scale({ x: p.iconScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(p.xPos, p.eng.height - innerBottomRight.y, -1);
    spriteController.setSprite('menu.left.middle');

    // right edge
    spriteController.activeSprite(dialogId + 'menu.right.middle');
    spriteController.scale({ x: p.iconScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopRight.x, p.eng.height - innerBottomRight.y, -1);
    spriteController.setSprite('menu.right.middle');

    // center
    spriteController.activeSprite(dialogId + 'menu.center.middle');
    spriteController.scale({ x: topEdgeScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(innerTopLeft.x, p.eng.height - innerBottomRight.y, -1);
    spriteController.setSprite('menu.center.middle');

    // commit the changes to the buffer
    spriteController.commitToBuffer();
  }
}
