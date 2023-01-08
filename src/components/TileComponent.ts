import { Engine } from '../core/Engine';
import { SpritController } from '../environment/SpriteController';
import vec2 from '../math/vec2';
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
   * This is the tile height index. Subtract one because
   * the tile is one level above the cell it is on.
   */
  get tileHeightIndex(): number {
    return this._tileIndex.z - 1;
  }

  /**
   * Get the height offset in tile space
   */
  get tileHeight(): number {
    return this._tilePosition.z;
  }
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

  /**
   * Set the position in tile space. This will recalculate the tile position
   * and set the sprite position.
   * @param i
   * @param j
   * @param k
   */
  setTilePosition(i: number, j: number, k: number) {
    const screen = this.eng.tileManger.toScreenLoc(i, j, k);

    this._tilePosition.x = i;
    this._tilePosition.y = j;
    this._tilePosition.z = k;

    this._tileIndex.x = Math.floor(this._tilePosition.x);
    this._tileIndex.y = Math.floor(this._tilePosition.y);
    this._tileIndex.z = Math.floor(this._tilePosition.z);

    this._screenPosition.x = screen.x;
    this._screenPosition.y = screen.y;
    this._screenPosition.z = screen.z;

    this.updateSpritePosition();
  }

  /**
   * Sets the height of the tile component
   * @param increment -Float value. The value that will be added to the tile position. This can be negative
   * if the tile is to move down.
   */
  adjustTileHeight(increment: number) {
    this._tilePosition.z += increment;
    this._tileIndex.z = Math.floor(this._tilePosition.z);

    const screen = this.eng.tileManger.toScreenLoc(
      this.tilePosition.x,
      this.tilePosition.y,
      this.tilePosition.z
    );

    this._screenPosition.x = screen.x;
    this._screenPosition.y = screen.y;
    this._screenPosition.z = screen.z;

    this.updateSpritePosition();
  }

  /**
   * Moves the tile by a given amount
   * @param i
   * @param j
   * @param k
   */
  OffsetTilePosition(i: number, j: number, k: number) {
    const tileX = Math.floor(this._tilePosition.x);
    const tileY = Math.floor(this._tilePosition.y);
    const tileZ = Math.floor(this._tilePosition.z);
    const floorHeight = tileZ - 1;

    const fractionI = this.tilePosition.x % 1;
    const fractionJ = this.tilePosition.y % 1;
    const dir = new vec3([i, j, k]);

    let access = true;
    const ground = this.eng.scene.ground;

    // left
    if (dir.x < 0 && fractionI < 0.25) {
      // cancel x movement
      if (!ground.canAccessTile(this, tileX - 1, tileY, floorHeight)) {
        dir.x = 0;
      }
    }

    // right
    else if (dir.x > 0 && fractionI > 0.75) {
      // cancel x movement
      if (!ground.canAccessTile(this, tileX + 1, tileY, floorHeight)) {
        dir.x = 0;
      }
    }

    // down
    if (dir.y < 0 && fractionJ < 0.25) {
      // cancel y movement
      if (!ground.canAccessTile(this, tileX, tileY - 1, floorHeight)) {
        dir.y = 0;
      }
    }
    // up
    else if (dir.y > 0 && fractionJ > 0.75) {
      // cancel y movement
      if (!ground.canAccessTile(this, tileX, tileY + 1, floorHeight)) {
        dir.y = 0;
      }
    }

    // check corners
    if (dir.x > 0 && dir.y > 0 && fractionJ > 0.75 && fractionI > 0.75) {
      //top right
      if (!ground.canAccessTile(this, tileX + 1, tileY + 1, floorHeight)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y > 0 && fractionJ < 0.25 && fractionI > 0.75) {
      //top left
      if (!ground.canAccessTile(this, tileX - 1, tileY + 1, floorHeight)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y < 0 && fractionJ < 0.25 && fractionI < 0.25) {
      //bottom left
      if (!ground.canAccessTile(this, tileX - 1, tileY - 1, floorHeight)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    } else if (dir.x < 0 && dir.y > 0 && fractionJ < 0.25 && fractionI > 0.75) {
      //bottom right
      if (!ground.canAccessTile(this, tileX - 1, tileY + 1, floorHeight)) {
        if (Math.abs(dir.x) > Math.abs(dir.y)) {
          dir.y = 0;
        } else {
          dir.x = 0;
        }
      }
    }

    // check if the player can access this tile
    if (dir.length() > 0) {
      this.moveToTilePosition(
        this._tilePosition.x + dir.x,
        this._tilePosition.y + dir.y,
        this._tilePosition.z + dir.z
      );
    }
  }

  /**
   * Sets the tile position to a new value
   * @param i
   * @param j
   * @param k
   */
  moveToTilePosition(i: number, j: number, k: number) {
    console.debug(
      'tile ' + i.toFixed(5) + ', ' + j.toFixed(5) + ', ' + k.toFixed(5)
    );

    // we need this to be an int to lookup the tiles
    const tileX = Math.floor(i);
    const tileY = Math.floor(j);
    const tileZ = Math.floor(k);

    const floor = tileZ - 1;

    // we moved off the last tile call on exit
    if (this._tileIndex.x != tileX || this._tileIndex.y != tileY) {
      this.eng.scene.ground.onExit(
        this,
        this._tileIndex.x,
        this._tileIndex.y,
        floor
      );
    }

    const screen = this.eng.tileManger.toScreenLoc(i, j, k);
    // perform all state updates
    this._screenPosition.x = screen.x;
    this._screenPosition.y = screen.y;
    this._screenPosition.z = screen.z;

    this._tilePosition.x = i;
    this._tilePosition.y = j;
    this._tilePosition.z = k;

    this._tileIndex.x = tileX;
    this._tileIndex.y = tileY;
    this._tileIndex.z = tileZ;

    // enter a new tile
    this.eng.scene.ground.onEnter(
      this,
      this._tileIndex.x,
      this._tileIndex.y,
      floor
    );

    this.updateSpritePosition();
  }

  /**
   * Updates the sprite's position
   */
  protected updateSpritePosition() {
    // We only need the depth this way the tile matches the depth it is on.
    const screenDepth = this.eng.tileManger.toScreenLoc(
      this._tileIndex.x,
      this._tileIndex.y,
      this._tileIndex.z
    );

    // move the player
    this._spriteController.setSpritePosition(
      this._screenPosition.x,
      this._screenPosition.y,
      screenDepth.z,
      screenDepth.z,
      true
    );
  }
}
