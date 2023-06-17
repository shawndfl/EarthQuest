import { Engine } from '../core/Engine';
import { SpritBaseController } from '../graphics/SpriteBaseController';
import { SpritBatchController } from '../graphics/SpriteBatchController';
import { SpritController } from '../graphics/SpriteController';
import { TileFactory } from '../systems/TileFactory';
import { Component } from './Component';
import { TileComponent } from './TileComponent';

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
    return this.tileHeight;
  }

  onExit(tileComponent: TileComponent): void {
    this._lastK = undefined;
  }

  onEnter(tileComponent: TileComponent): void {
    const pos = tileComponent.tilePosition;
    if (this._lastK === undefined) {
      this._lastK = tileComponent.tileIndex.z;
    }

    const delta = pos.y - tileComponent.tileIndex.y;
    const z = this._lastK + delta;
    tileComponent.setTilePosition(pos.x, pos.y, z);
  }

  canAccessTile(tileComponent: TileComponent): boolean {
    // TODO check if the tile is
    // accessing from the correct location

    console.debug(
      'CanAccess slop from pos ' + tileComponent.tileIndex.toString() + ' tile pos ' + this.tileIndex.toString()
    );

    // if slop is to the left the tile component
    // needs to be entering from the left i-1
    if (this.type.includes('left')) {
      if (tileComponent.tileIndex.x == this.tileIndex.x && tileComponent.tileIndex.y == this.tileIndex.y + 1) {
        return true;
      } else if (tileComponent.tileIndex.x == this.tileIndex.x && tileComponent.tileIndex.y == this.tileIndex.y - 1) {
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
