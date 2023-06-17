import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { SpritController } from '../graphics/SpriteController';
import { TileFactory } from '../systems/TileFactory';
import { Component } from './Component';
import { TileComponent } from './TileComponent';
import { TileContext } from './TileContext';

export class SlopTileComponent extends TileComponent {
  protected _tileId: string;
  protected _spriteId: string;
  protected _type: string;
  protected _lastK: number;

  get id(): string {
    return this._tileId;
  }

  get type(): string {
    return this._type;
  }

  get spriteController(): SpritBaseController {
    this._spriteController.activeSprite(this.id);
    return this._spriteController;
  }

  /**
   * Gets the tile's height at a given i and j position.
   * This is used to slops and stairs.
   * @param i
   * @param j
   * @returns
   */
  getTileHeight(i: number, j: number) {
    const slopHeight = j - this.tileIndex.y;
    return this.tileHeight + slopHeight;
  }

  onExit(tileComponent: TileComponent, tileContext: TileContext): void {
    this._lastK = undefined;
  }

  onEnter(tileComponent: TileComponent, tileContext: TileContext): void {
    const pos = tileComponent.tilePosition;
    //const z = tileComponent.tileIndex.z + (this.tileIndex.y - this.tilePosition.y); // this.getTileHeight(this.tilePosition.x, this.tilePosition.y);
    // todo check slop direction
    if (tileContext.direction.y < 0) {
      tileComponent.setTilePosition(pos.x, pos.y, pos.z + 1);
    } else if (tileContext.direction.y > 0) {
      tileComponent.setTilePosition(pos.x, pos.y, pos.z - 1);
    }

    const tileBelow = tileComponent.getTileBelow();
    console.debug(' should be ' + this.type + ': ' + tileBelow.type + ' context ' + tileContext.direction);
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    // if slop is to the left the tile component
    // needs to be entering from the left i-1
    const sameHeight = tileComponent.tileIndex.z == this.tileIndex.z;
    const oneBelow = tileComponent.tileIndex.z - 1 == this.tileIndex.z;
    const enterFromLeft =
      tileComponent.tileIndex.x == this.tileIndex.x && tileComponent.tileIndex.y == this.tileIndex.y + 1;
    const enterFromRight =
      tileComponent.tileIndex.x == this.tileIndex.x && tileComponent.tileIndex.y == this.tileIndex.y - 1;

    if (this.type.includes('left')) {
      if (oneBelow && enterFromRight) {
        return true;
      } else if (sameHeight && enterFromLeft) {
        return true;
      }
    }

    return false;
  }

  constructor(
    eng: Engine,
    protected _spriteController: SpritBatchController,
    typeAndSprite: string,
    i: number,
    j: number,
    k: number
  ) {
    super(eng);
    const parts = typeAndSprite.split('|');
    this._type = parts[0];
    this._spriteId = parts[1];
    this._tileId = TileFactory.createStaticID(i, j, k);
    this._spriteController.activeSprite(TileFactory.createStaticID(i, j, k));

    this._spriteController.setSprite(this._spriteId);
    this._spriteController.scale(this.eng.tileScale);

    this.setTilePosition(i, j, k);
  }
}
