import { Texture } from '../graphics/Texture';
import { Component } from '../core/Component';
import { SpritePerspectiveShader } from '../shaders/SpritePerspectiveShader';
import DefaultTileAtlas from '../assets/data/tileAtlas.json';
import { SceneType } from './SceneType';

/**
 * The main scene for walking around in the world. The player can
 * walk around talk to NPC pick up items and fight enemies.
 *
 */
export abstract class Scene extends Component {
  private _spriteSheetTexture: Texture;

  get spriteSheetTexture(): Texture {
    return this._spriteSheetTexture;
  }

  abstract get type(): SceneType;

  /**
   * Called for each frame.
   * @param {float} dt delta time from the last frame
   */
  update(dt: number) {}

  createRandomFlowers(): void {
    const replacements = ['00', '09', '0A', '0B', '0C'];
    const replacementProbability = 0.01; // 1% chance to replace each "00"

    // Function to process each string
    const map = [];
    for (let i = 0; i < 288; i++) {
      let row = '';
      for (let j = 0; j < 288; j++) {
        if (Math.random() < replacementProbability) {
          row += replacements[Math.floor(Math.random() * replacements.length)];
        } else {
          row += '00';
        }
      }
      map.push(row);
    }

    console.log(map);
  }

  createNull(): void {
    // Function to process each string
    const map = [];
    for (let i = 0; i < 288; i++) {
      let row = '';
      for (let j = 0; j < 288; j++) {
        row += '_0';
      }
      map.push(row);
    }

    console.log(map);
  }

  createGrass(): void {
    // Function to process each string
    const map = [];
    for (let i = 0; i < 288; i++) {
      let row = '';
      for (let j = 0; j < 288; j++) {
        row += '04';
      }
      map.push(row);
    }

    console.log(map);
  }
}
