import { Engine } from '../core/Engine';
import { SpritController } from '../environment/SpriteController';
import vec3 from '../math/vec3';
import { Component } from './Component';

export abstract class TileComponent extends Component {
  /**
   * Screen position in pixels of the screen. z range is from 1 to -1  (-1 is in front)
   */
  protected _screenPosition: vec3;
  /**
   * Tile position as a float
   */
  protected _tilePosition: vec3;
  /**
   * Tile position as an int. Used in look up tables
   */
  protected _tileIndex: vec3;
  /**
   * Sprite for this tile
   */
  protected _spriteController: SpritController;

  /**
   * get the screen position
   */
  get screenPosition(): vec3 {
    return this._screenPosition;
  }

  /**
   * get the tile position
   */
  get tilePosition(): vec3 {
    return this._tilePosition;
  }

  /**
   * Gets the id of the thing
   */
  abstract get id(): string;

  /**
   * Gets the type of the tile component
   */
  abstract get type(): string;

  constructor(eng: Engine) {
    super(eng);

    this._screenPosition = new vec3([0, 0, 0]);
    this._tileIndex = new vec3([0, 0, 0]);
    this._tilePosition = new vec3([0, 0, 0]);
  }

  moveToScreenPosition(x: number, y: number, z: number) {
    console.debug(
      'pos ' + x.toFixed(5) + ', ' + y.toFixed(5) + ', ' + z.toFixed(5)
    );

    // recalculated the screen position to get the correct depth for the sprite
    const tile = this.eng.tileManger.toTileLoc(x, y, z);

    // we need this to be an int to lookup the tiles
    const tileX = Math.round(tile.i);
    const tileY = Math.round(tile.j);
    const tileZ = Math.floor(tile.k); // just take the floor, b/c this is the floor

    // check if the player can access this tile
    if (this.eng.scene.ground.canAccessTile(this, tileX, tileY, tileZ)) {
      // we moved off the last tile call on exit
      if (this._tileIndex.x != tileX || this._tileIndex.y != tileY) {
        this.eng.scene.ground.onExit(
          this,
          this._tileIndex.x,
          this._tileIndex.y,
          this._tileIndex.z
        );
      }

      // perform all state updates
      this._screenPosition.x = x;
      this._screenPosition.y = y;
      this._screenPosition.z = z;

      this._tilePosition.x = tile.i;
      this._tilePosition.y = tile.j;
      this._tilePosition.z = tile.k;

      this._tileIndex.x = tileX;
      this._tileIndex.y = tileY;
      this._tileIndex.z = tileZ; // just take the floor, b/c this is the floor

      // enter a new tile
      this.eng.scene.ground.onEnter(
        this,
        this._tileIndex.x,
        this._tileIndex.y,
        this._tileIndex.z
      );

      // move the player
      this._spriteController.setSpritePosition(x, y, z, z, true);
    }
  }
}
