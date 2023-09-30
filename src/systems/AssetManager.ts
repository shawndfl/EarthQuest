import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import CharacterImage from '../assets/characters.png';
import CharacterData from '../assets/characters.json';
import TileImage from '../assets/isometricTile.png';
import TileData from '../assets/isometricTile.json';
import MenuImage from '../assets/menu.png';
import BattleBg1 from '../assets/backgrounds/battleBg1.png';
import MenuData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import { IFontData } from '../graphics/IFontData';
import { ISpriteData, ITileData } from '../graphics/ISpriteData';


export interface ISpriteDataAndImage {
  tileData: ITileData;
  /** The index of the tile in the list */
  spriteIndex: number;
  image: HTMLImageElement;
}


/**
 * Manages texture assets
 */
export class AssetManager extends Component {
  private _font: Texture;
  private _character: Texture;
  private _characterImage: HTMLImageElement;

  private _tile: Texture;
  private _tileImage: HTMLImageElement;

  private _menu: Texture;
  private _menuImage: HTMLImageElement;

  private _battleBg1: Texture;

  get font(): { texture: Texture; data: IFontData[] } {
    return { texture: this._font, data: FontData };
  }

  get character(): { texture: Texture; data: ISpriteData } {
    return { texture: this._character, data: CharacterData };
  }

  get tile(): { texture: Texture; data: ISpriteData } {
    return { texture: this._tile, data: TileData };
  }

  get menu(): { texture: Texture; data: ISpriteData } {
    return { texture: this._menu, data: MenuData };
  }

  get battle01(): { texture: Texture } {
    return { texture: this._battleBg1 };
  }

  constructor(eng: Engine) {
    super(eng);
  }

  async initialize(): Promise<void> {
    this._tile = new Texture(this.gl);
    this._tileImage = await this._tile.loadImage(TileImage);

    this._character = new Texture(this.gl);
    this._characterImage = await this._character.loadImage(CharacterImage);

    this._font = new Texture(this.gl);
    await this._font.loadImage(FontImage);

    this._menu = new Texture(this.gl);
    this._menuImage = await this._menu.loadImage(MenuImage);

    this._battleBg1 = new Texture(this.gl);
    await this._battleBg1.loadImage(BattleBg1);
  }

  /**
   * Gets a list of tiles form the tile data and character data
   * @returns 
   */
  getTileAssetList(): string[] {
    const tileId = (TileData as ISpriteData).tiles.map((tile) => tile.id);
    tileId.push(... (CharacterData as ISpriteData).tiles.map((tile) => tile.id));
    return tileId;
  }

  /**
   * Gets the image by looking up the sprite id.
   * @param id 
   * @returns 
   */
  getImageFrom(id: string): ISpriteDataAndImage {
    // check the tileData
    let index = 0;
    let tileData = (TileData as ISpriteData).tiles.find((tile, i) => {
      if (tile.id == id) {
        index = i;
        return true;
      }
      return false;
    });
    if (tileData) {
      const data = (TileData as ISpriteData);
      if (!tileData.loc) {
        tileData.loc = [(tileData.index[0]) * data.tileWidth, (tileData.index[1]) * data.tileHeight, data.tileWidth, data.tileHeight];
      }
      return { tileData, spriteIndex: index, image: this._tileImage as HTMLImageElement };
    }

    // if not found check the character data
    if (!tileData) {
      let tileData = (CharacterData as ISpriteData).tiles.find((tile, i) => {
        if (tile.id == id) {
          index = i;
          return true;
        }
        return false;
      });
      if (tileData) {
        const data = (CharacterData as ISpriteData);
        if (!tileData.loc) {
          tileData.loc = [(tileData.index[0]) * data.tileWidth, (tileData.index[1]) * data.tileHeight, data.tileWidth, data.tileHeight];
        }
        return { tileData, spriteIndex: index, image: this._characterImage.cloneNode(true) as HTMLImageElement };
      }
    }

    // no where to be found
    if (!tileData) {
      console.error('Error sprite ' + id + ' not found.');
      return null;
    }
  }
}
