import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import FontImage from '../assets/font.png';
import FontData from '../assets/font.json';
import CharacterImage from '../assets/characters.png';
import CharacterData from '../assets/characters.json';
import TileSheetImage from '../assets/isometricTile.png';
import TileSheetData from '../assets/isometricTile.json';
import MenuImage from '../assets/menu.png';
import BattleBg1 from '../assets/backgrounds/battleBg1.png';
import MenuData from '../assets/menu.json';
import { Texture } from '../graphics/Texture';
import { IFontData } from '../graphics/IFontData';
import { ISpriteData, ITileData } from '../graphics/ISpriteData';

export interface ISpriteDataAndImage {
  tileData: ITileData;
  spriteData: ISpriteData;
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
    return { texture: this._tile, data: TileSheetData };
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
    this._tileImage = await this._tile.loadImage(TileSheetImage);

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
    const tileId = (TileSheetData as ISpriteData).tiles.map((tile) => tile.id);
    tileId.push(...(CharacterData as ISpriteData).tiles.map((tile) => tile.id));
    return tileId;
  }

  /**
   * Gets the image by looking up the sprite id.
   * @param id
   * @returns
   */
  getImageFrom(id: string): ISpriteDataAndImage {
    // check the tileData
    let spriteData = TileSheetData as ISpriteData;
    let index = 0;
    let tileData = spriteData.tiles.find((tile, i) => {
      if (tile.id == id) {
        index = i;
        return true;
      }
      return false;
    });
    if (tileData) {
      if (!tileData.loc) {
        tileData.loc = [
          spriteData.tileOffset + (tileData.index[0] + spriteData.tileSpacing) * spriteData.tileWidth,
          spriteData.tileOffset + (tileData.index[1] + spriteData.tileSpacing) * spriteData.tileHeight,
          spriteData.tileWidth,
          spriteData.tileHeight,
        ];
      }
      return { spriteData, tileData, spriteIndex: index, image: this._tileImage as HTMLImageElement };
    }

    // if not found check the character data
    if (!tileData) {
      spriteData = CharacterData as ISpriteData;
      let tileData = spriteData.tiles.find((tile, i) => {
        if (tile.id == id) {
          index = i;
          return true;
        }
        return false;
      });
      if (tileData) {
        if (!tileData.loc) {
          tileData.loc = [
            spriteData.tileOffset + (spriteData.tileWidth + spriteData.tileSpacing) * tileData.index[0],
            spriteData.tileOffset + (spriteData.tileHeight + spriteData.tileSpacing) * tileData.index[1],
            spriteData.tileWidth,
            spriteData.tileHeight,
          ];
        }
        return {
          spriteData,
          tileData,
          spriteIndex: index,
          image: this._characterImage.cloneNode(true) as HTMLImageElement,
        };
      }
    }

    // no where to be found
    if (!tileData) {
      console.error('Error sprite ' + id + ' not found.');
      return null;
    }
  }

  /**
   * Request a json file
   * @param url
   * @returns
   */
  async requestJson(url: string): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = (e) => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const json = JSON.parse(xhr.responseText);
            return resolve(json);
          } else {
            console.error(xhr.statusText);
            return reject(xhr.statusText);
          }
        }
      };
      xhr.onerror = (e) => {
        console.error(xhr.statusText);
        return reject(xhr.statusText);
      };
      xhr.send(null);
    });

    return promise;
  }
}
