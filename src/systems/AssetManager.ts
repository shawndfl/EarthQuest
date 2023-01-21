import { Component } from '../components/Component';
import { Engine } from '../core/Engine';
import FontImage from '../assets/font.png';
import CharacterImage from '../assets/characters.png';
import TileImage from '../assets/isometricTile.png';
import MenuImage from '../assets/menu.png';
import { Texture } from '../graphics/Texture';

/**
 * Manages texture assets
 */
export class AssetManager extends Component {
  private _font: Texture;
  private _character: Texture;
  private _tile: Texture;
  private _menu: Texture;

  get font() {
    return this._font;
  }

  get character() {
    return this._character;
  }

  get tile() {
    return this._tile;
  }

  get menu() {
    return this._menu;
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
  }
}
