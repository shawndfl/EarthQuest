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
  image: HTMLImageElement;
}


/**
 * Manages texture assets
 */
export class AssetManager extends Component {
  private _font: Texture;
  private _character: Texture;
  private _tile: Texture;
  private _menu: Texture;
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

  async initialize() {
    this._tile = new Texture(this.gl);
    await this._tile.loadImage(TileImage);

    this._character = new Texture(this.gl);
    await this._character.loadImage(CharacterImage);

    this._font = new Texture(this.gl);
    await this._font.loadImage(FontImage);

    this._menu = new Texture(this.gl);
    await this._menu.loadImage(MenuImage);

    this._battleBg1 = new Texture(this.gl);
    await this._battleBg1.loadImage(BattleBg1);
  }

  /**
   * Gets the image by looking up the sprite id.
   * @param id 
   * @returns 
   */
  async getImageFrom(id: string): Promise<ISpriteDataAndImage> {
    const promise = new Promise<ISpriteDataAndImage>((resolve, reject) => {

      // check the tileData
      let tileData = (TileData as ISpriteData).tiles.find((tile) => tile.id == id);
      if (tileData) {
        const image = new Image();
        image.onload = () => {
          const data = (TileData as ISpriteData);
          if (!tileData.loc) {
            tileData.loc = [(tileData.index[0] + 1) * data.tileWidth, (tileData.index[1] + 1) * data.tileHeight, data.tileWidth, data.tileHeight];
          }
          resolve({ tileData, image });
        };
        image.onerror = () => {
          resolve(null);
        }
        image.src = TileImage;
      }

      // if not found check the character data
      if (!tileData) {
        tileData = (CharacterData as ISpriteData).tiles.find((tile) => tile.id == id);
        if (tileData) {
          const image = new Image();
          image.onload = () => {
            const data = (CharacterData as ISpriteData);
            if (!tileData.loc) {
              tileData.loc = [tileData.index[0] * data.tileWidth, tileData.index[1] * data.tileHeight, data.tileWidth, data.tileHeight];
            }

            resolve({ tileData, image });
          };
          image.onerror = () => {
            resolve(null);
          }
          image.src = CharacterImage;
        }
      }

      // no where to be found
      if (!tileData) {
        resolve(null);
      }

    });
    return promise;
  }
}
