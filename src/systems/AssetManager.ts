import { Engine } from '../core/Engine';
import { Component } from '../core/Component';
import { Texture } from '../graphics/Texture';

/**
 * Manages texture assets
 */
export class AssetManager extends Component {
  private _textureCache: Map<string, Texture> = new Map();

  async initialize(): Promise<void> {}

  /**
   * Get a texture
   * @param path
   * @returns
   */
  async getTexture(path: string): Promise<Texture> {
    if (this._textureCache.has(path)) {
      return this._textureCache.get(path);
    }

    const texture = new Texture(this.gl);
    await texture.loadImage(path);
    this._textureCache.set(path, texture);
    return texture;
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
            return resolve(null);
          }
        }
      };
      xhr.onerror = (e) => {
        console.error(xhr.statusText);
        return resolve(null);
      };
      xhr.send(null);
    });

    return promise;
  }
}
