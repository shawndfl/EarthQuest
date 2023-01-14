import { SpritBatchController } from '../graphics/SpriteBatchController';
import vec2 from '../math/vec2';
import { IDialogParams } from '../menus/IDialogParams';

/**
 * This class is used to build the visual dialog box
 */
export class DialogBuilder {
  static buildDialog(spriteController: SpritBatchController, p: IDialogParams) {
    const innerX = p.xPos + p.tileWidth * p.iconScale;

    // inner y is like the bottom corner of the text filed.
    // p.yPos is pixels from the top of the screen
    const innerTopLeft = new vec2(
      p.xPos + p.tileWidth * p.iconScale,
      p.yPos + p.tileHeight * p.iconScale
    );
    const innerTopRight = new vec2(
      p.xPos + (p.width - p.tileWidth * p.iconScale),
      p.yPos + p.tileHeight * p.iconScale
    );
    const innerBottomRight = new vec2(
      p.xPos + (p.width - p.tileWidth * p.iconScale),
      p.height + p.yPos - p.tileHeight * p.iconScale
    );
    const innerBottomLeft = new vec2(
      p.xPos + p.tileWidth * p.iconScale,
      p.height + p.yPos - p.tileHeight * p.iconScale
    );

    const bottomRight = new vec2(
      p.xPos + (p.width - p.tileWidth * p.iconScale),
      p.height + p.yPos
    );
    const bottomLeft = new vec2(
      p.xPos + p.tileWidth * p.iconScale,
      p.height + p.yPos
    );

    // top left corner
    spriteController.activeSprite('menu.left.top');
    spriteController.scale(p.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(
      p.xPos,
      p.eng.height - innerTopLeft.y,
      -1
    );
    spriteController.setSprite('menu.left.top', true);

    // top right corner
    spriteController.activeSprite('menu.right.top');
    spriteController.scale(p.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(
      innerTopRight.x,
      p.eng.height - innerTopRight.y,
      -1
    );
    spriteController.setSprite('menu.right.top', true);

    // bottom right corner
    spriteController.activeSprite('menu.right.bottom');
    spriteController.scale(p.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(
      innerTopRight.x,
      p.eng.height - bottomRight.y,
      -1
    );
    spriteController.setSprite('menu.right.bottom', true);

    // bottom left corner
    spriteController.activeSprite('menu.left.bottom');
    spriteController.scale(p.iconScale);
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(p.xPos, p.eng.height - bottomLeft.y, -1);
    spriteController.setSprite('menu.left.bottom', true);

    const topEdgeScale = (innerTopRight.x - innerTopLeft.x) / p.tileWidth;
    const rightEdgeScale =
      (innerBottomRight.y - innerTopRight.y) / p.tileHeight;

    // top edge
    spriteController.activeSprite('menu.center.top');
    spriteController.scale({ x: topEdgeScale, y: p.iconScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(
      innerTopLeft.x,
      p.eng.height - innerTopRight.y,
      -1
    );
    spriteController.setSprite('menu.center.top', true);

    // bottom edge
    spriteController.activeSprite('menu.center.bottom');
    spriteController.scale({ x: topEdgeScale, y: p.iconScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(
      innerTopLeft.x,
      p.eng.height - bottomRight.y,
      -1
    );
    spriteController.setSprite('menu.center.bottom', true);

    // left edge
    spriteController.activeSprite('menu.left.middle');
    spriteController.scale({ x: p.iconScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(
      p.xPos,
      p.eng.height - innerBottomRight.y,
      -1
    );
    spriteController.setSprite('menu.left.middle', true);

    // right edge
    spriteController.activeSprite('menu.right.middle');
    spriteController.scale({ x: p.iconScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(
      innerTopRight.x,
      p.eng.height - innerBottomRight.y,
      -1
    );
    spriteController.setSprite('menu.right.middle', true);

    // center
    spriteController.activeSprite('menu.center.middle');
    spriteController.scale({ x: topEdgeScale, y: rightEdgeScale });
    spriteController.viewOffset(new vec2(0, 0));
    spriteController.viewScale(1.0);
    spriteController.setSpritePosition(
      innerTopLeft.x,
      p.eng.height - innerBottomRight.y,
      -1
    );
    spriteController.setSprite('menu.center.middle', true);
  }
}
