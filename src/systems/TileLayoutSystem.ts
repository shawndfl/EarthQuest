import { CanvasTexture, NearestFilter, Scene, Sprite, SpriteMaterial } from 'three';
import { AsepriteSpriteSheet, assetManager } from '../assets';

// A 32px-wide diamond at 16 pixels per unit spans a grid cell's diagonal.
export const tileSize = Math.SQRT2;

// The fixed isometric camera looks down both grid axes equally.
export function isometricOrder(x: number, z: number): number {
  return (x + z) / tileSize;
}

export class TileLayoutSystem {
  private readonly solid = new Set<number>();
  private ready = false;

  constructor(private readonly rows: readonly string[]) { }

  async load(scene: Scene): Promise<void> {
    const sheet = await AsepriteSpriteSheet.load(assetManager, 'tiles/tiles.json');
    const materials = new Map<number, SpriteMaterial>();
    const canvas = document.createElement('canvas');
    const size = sheet.data.meta.size;
    canvas.width = size.w;
    canvas.height = size.h;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot read tile collision masks');
    context.drawImage(sheet.texture.image as HTMLImageElement, 0, 0);

    for (const [name, { frame }] of Object.entries(sheet.data.frames)) {
      const match = /\((Layer 1|CollisionMask)\) (\d+)\.aseprite$/.exec(name);
      if (!match) {
        continue;
      }
      const id = Number(match[2]);

      if (match[1] === 'CollisionMask') {
        const { data } = context.getImageData(frame.x, frame.y, frame.w, frame.h);

        // collect all the collision colors that are greater than 50% red
        if (data.some((value, i) => i % 4 === 3 && value > 128)) {
          this.solid.add(id);
        }
        continue;
      }

      // Isolate each frame so samples at its edges clamp to this tile.
      const tile = document.createElement('canvas');
      tile.width = frame.w;
      tile.height = frame.h;
      const pixels = tile.getContext('2d');
      if (!pixels) {
        throw new Error('Cannot extract tile artwork');
      }
      pixels.drawImage(canvas, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
      const map = new CanvasTexture(tile);
      map.colorSpace = sheet.texture.colorSpace;
      map.minFilter = map.magFilter = NearestFilter;
      map.generateMipmaps = false;
      materials.set(id, new SpriteMaterial({ map, alphaTest: 0.5, transparent: true, depthTest: false, depthWrite: false }));
    }

    this.rows.forEach((row, z) => {
      Array.from(row).forEach((cell, x) => {
        const id = Number(cell);
        const material = materials.get(id);
        if (!material) {
          throw new Error(`Missing tile frame ${cell}`);
        }

        const sprite = new Sprite(material);
        sprite.scale.set(2, 2, 1);
        sprite.center.set(0.5, 0.25);
        sprite.position.set(x * tileSize, 0, z * tileSize);
        sprite.renderOrder = this.solid.has(id)
          ? isometricOrder(sprite.position.x, sprite.position.z)
          : x + z - this.rows.length - row.length;
        scene.add(sprite);
      });
    });
    this.ready = true;
  }

  blocked(column: number, row: number): boolean {
    const cell = this.rows[row]?.[column];
    return !this.ready || cell === undefined || this.solid.has(Number(cell));
  }
}
