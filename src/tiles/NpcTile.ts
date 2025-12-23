import { SpriteDirection } from '../data/SpriteDirection';
import { Curve } from '../math/Curve';
import vec2 from '../math/vec2';
import vec4 from '../math/vec4';
import { UserAction } from '../systems/InputManager';
import { TextReturn, TextTab } from '../ui/dialogs/DialogComponent';
import { PlayerTile } from './PlayerTile';
import { RigidBodyTile } from './RigidBodyTile';

export class NpcTile extends RigidBodyTile {
  private curve: Curve;

  async initialize(): Promise<void> {
    await super.initialize();
    this.curve = new Curve();
    this.curve.points([
      { p: 0, t: 0 },
      { p: 1, t: 1000 },
      { p: 0, t: 2000 },
    ]);
    this.curve.repeat(-1);

    this.curve.start(true, undefined, (value) => {
      //TODO toggle the image over time
      this.quad.mirrorX = !!value;
      this.requestGeometryRefresh();
    });
  }

  update(dt: number): void {
    this.curve.update(dt);

    if (this.eng.dialogManager.dialogHasFocus()) {
      return;
    }

    if (this.eng.inputManager.isReleased(UserAction.A)) {
      if (this.withInRangeOfPlayer() && this.playerIsFacingMe()) {
        this.eng.dialogManager.showDialog({
          text:
            "I know you. You're that\ntough kid! " +
            TextReturn +
            'Do you want to fight!?!\n' +
            TextTab +
            "I'll kick your butt\n" +
            TextTab +
            'No thanks',
          fontScale: 1,
          textPadding: 5,
          color: new vec4(1, 1, 1, 1),
          height: 100,
          width: 300,
          id: 'Poo.1',
          onAccept: (options) => {},
          onClose: (options) => {},
          position: new vec2(50, this.eng.height - 100 - 50),
        });
        this.eng.inputManager.clearRelease();
      }
    }
  }

  protected withInRangeOfPlayer(): boolean {
    const player = this.eng.tileManager.playerTile;

    const minInteractionDistance = 50;

    if (this.bounds.distance(player.bounds) < minInteractionDistance) {
      return true;
    } else {
      return false;
    }
  }

  protected playerIsFacingMe(): boolean {
    const player = this.eng.tileManager.playerTile;
    // N
    if (player.bounds.top < this.bounds.bottom) {
      return player.facing == SpriteDirection.North;
    }
    //E
    if (player.bounds.right < this.bounds.left) {
      return player.facing == SpriteDirection.East;
    }
    //S
    if (player.bounds.bottom > this.bounds.top) {
      return player.facing == SpriteDirection.South;
    }
    //w
    if (player.bounds.left > this.bounds.right) {
      return player.facing == SpriteDirection.West;
    }

    return true;
  }
}
