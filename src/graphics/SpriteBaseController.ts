import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import { GlBuffer, IQuadModel } from './GlBuffer';
import { ISpriteData } from './ISpriteData';
import { Sprite, SpriteFlip } from './Sprite';
import { Texture } from './Texture';
import { ISpriteController } from './ISprintController';
import vec2 from '../math/vec2';

/**
 * This class controls a sprite's position and scale
 * given a sprite sheet and some json data that holds the
 * sprite offset and size in pixels.
 */
export abstract class SpritBaseController extends Component implements ISpriteController {
  protected _spriteData: ISpriteData;
  private _indexLookup: Map<string, number>;
  protected _spriteTexture: Texture;
  protected _buffer: GlBuffer;
  protected _selectedSpriteIndex: number;
  protected _selectedSpriteId: string;
  protected _viewOffset: vec2;
  protected _viewScale: number;
  protected _dirty: boolean;

  abstract get sprite(): Sprite;

  get rotation(): number {
    return this.sprite.rotation;
  }

  protected get buffer() {
    return this._buffer;
  }

  get selectedSpriteIndex() {
    return this._selectedSpriteIndex;
  }

  get selectedSpriteId(): string {
    return this._selectedSpriteId;
  }

  get spriteCount(): number {
    return this._spriteData.tiles.length;
  }

  constructor(eng: Engine) {
    super(eng);
    this._spriteData;
    this._indexLookup = new Map<string, number>();
    this._selectedSpriteIndex = 0;
    this._dirty = true;
  }

  /**
   * setup the sprite
   * @param texture
   * @param spriteData
   */
  initialize(texture: Texture, spriteData: ISpriteData, defaultSprite?: string | number) {
    // save the data
    this._spriteData = spriteData;

    // cache the indices
    this._indexLookup.clear();
    this._spriteData.tiles.forEach((val, i) => {
      this._indexLookup.set(val.id, i);
    });

    // create the gl buffers for this sprite
    this._buffer = new GlBuffer(this.gl);

    // setup the shader for the sprite
    this._spriteTexture = texture;

    // needs to be committed to buffer when update is called
    this._dirty = true;
  }

  /**
   * Gets the list of all the sprites
   * @returns
   */
  getSpriteList(): string[] {
    const idList: string[] = [];
    this._spriteData.tiles.forEach((sprite) => idList.push(sprite.id));
    return idList;
  }

  /**
   * Sets the sprites position
   * @param x in screen pixels
   * @param y in screen pixels
   * @param scale multiplied by the sprite width and height
   * @param depth is depth buffer space (-1 to 1) 1 is far -1 is near
   */
  setSpritePosition(x: number, y: number, depth?: number) {
    this.sprite.setPosition(x, y, depth);
    this._dirty = true;
  }

  spriteWidth() {
    return this.sprite.getSpriteWidth();
  }

  spriteHeight() {
    return this.sprite.getSpriteHeight();
  }

  /**
   * Scale the image default is 1.0
   * @param scale uniform scale or separate components (x,y)
   */
  scale(scale: number | { x: number; y: number }) {
    this.sprite.setSpriteScale(scale);
    this._dirty = true;
  }

  /**
   * Flip the image.
   * @param flipDirection
   */
  flip(flipDirection: SpriteFlip): void {
    this.sprite.setSpriteFlip(flipDirection);
    this._dirty = true;
  }

  /**
   * Rotate the angle in degrees
   * @param angle In Degrees
   */
  rotate(angle: number): void {
    this.sprite.setSpriteRotate(angle);
    this._dirty = true;
  }

  /**
   * Sets the view offset for the projection. If undefined it will use the
   * offset from ViewManager
   * @param offset
   */
  viewOffset(offset?: vec2) {
    this._viewOffset = offset;
    this._dirty = true;
  }

  /**
   * Sets a view scale for the projection. If undefined it will use the
   * offset from ViewManager
   * @param scale
   */
  viewScale(scale?: number) {
    this._viewScale = scale;
    this._dirty = true;
  }

  /**
   * Select a sprite
   * @param id the id in the sprite sheet
   */
  setSprite(id?: string | number) {
    // find the sprite of a given id

    let index = 0;

    // number or look up
    if (typeof id === 'number') {
      index = id;
    } else {
      index = this._indexLookup.get(id);
    }

    const sprite = this._spriteData.tiles[index ?? 0];
    if (sprite) {
      // does the id match or if the id is null just pick the first one or if id is a
      // number does the index match
      this._selectedSpriteIndex = index;
      this._selectedSpriteId = sprite.id;

      const xOffset = sprite.offset ? sprite.offset[0] : 0;
      const yOffset = sprite.offset ? sprite.offset[1] : 0;

      this.sprite.setSpritePositionOffset(xOffset, yOffset);

      // use sprite loc
      if (sprite.loc) {
        this.sprite.setSprite({
          pixelXOffset: sprite.loc[0],
          pixelYOffset: sprite.loc[1],
          spriteWidth: sprite.loc[2],
          spriteHeight: sprite.loc[3],
        });
      } else {
        // use index
        const pixelX = this._spriteData.tileWidth * sprite.index[0];
        const pixelY = this._spriteData.tileHeight * sprite.index[1];

        this.sprite.setSprite({
          pixelXOffset: pixelX,
          pixelYOffset: pixelY,
          spriteWidth: this._spriteData.tileWidth,
          spriteHeight: this._spriteData.tileHeight,
        });
      }
      this._dirty = true;
    } else {
      console.error('cannot find sprite ' + id);
    }
  }

  /**
   * Commit the geometry to a gl buffer
   */
  abstract commitToBuffer(): void;

  /**
   * Draw the sprite
   * @param dt
   */
  update(dt: number) {
    // only commit to buffer if something changed
    if (this._dirty) {
      this.commitToBuffer();
      this._dirty = false;
    }

    if (!this._buffer.buffersCreated) {
      console.error('buffers are not created. Call commitToBuffers() first.');
    } else {
      this._buffer.enable();
      this.eng.spritePerspectiveShader.setSpriteSheet(this._spriteTexture);
      this.eng.spritePerspectiveShader.enable();

      const view = this.eng.viewManager;

      let projection = view.projection;
      if (this._viewOffset && this._viewScale) {
        projection = view.calculateProjection(this._viewOffset, this._viewScale);
      }

      // set the project
      this.eng.spritePerspectiveShader.setProj(projection);

      this.render();
    }
  }

  /**
   * render by calling gl draw functions
   */
  abstract render(): void;
}
