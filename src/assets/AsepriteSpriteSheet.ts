import {
  NearestFilter,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Texture,
} from 'three';
import type { AssetManager } from './AssetManager';

interface AsepriteRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface AsepriteFrameData {
  frame: AsepriteRect;
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: AsepriteRect;
  sourceSize: { w: number; h: number };
  duration: number;
}

type AsepriteFrames = Record<string, AsepriteFrameData> | AsepriteFrameData[];

interface AsepriteFrameTag {
  name: string;
  from: number;
  to: number;
  direction: 'forward' | 'reverse' | 'pingpong' | 'pingpong_reverse';
}

export interface AsepriteSheetData {
  frames: AsepriteFrames;
  meta: {
    image: string;
    size: { w: number; h: number };
    frameTags?: AsepriteFrameTag[];
  };
}

export interface AsepriteSpriteOptions {
  animation?: string;
  pixelsPerUnit?: number;
  autoplay?: boolean;
}

interface Animation {
  frames: number[];
}

/** Loaded Aseprite JSON metadata and its matching packed texture. */
export class AsepriteSpriteSheet {
  readonly frames: readonly AsepriteFrameData[];
  private readonly animations = new Map<string, Animation>();

  private constructor(
    readonly texture: Texture,
    readonly data: AsepriteSheetData,
  ) {
    this.frames = Object.values(data.frames);
    if (this.frames.length === 0) throw new Error('Aseprite sheet contains no frames');

    for (const [index, frame] of this.frames.entries()) {
      if (frame.rotated) {
        throw new Error(`Rotated Aseprite frame ${index} is not supported; export without rotation`);
      }
      if (frame.trimmed) {
        throw new Error(`Trimmed Aseprite frame ${index} is not supported; export without trimming`);
      }
      if (frame.duration <= 0 || frame.frame.w <= 0 || frame.frame.h <= 0) {
        throw new Error(`Aseprite frame ${index} has invalid dimensions or duration`);
      }
    }

    this.animations.set('all', { frames: this.frames.map((_, index) => index) });
    for (const tag of data.meta.frameTags ?? []) {
      this.animations.set(tag.name, { frames: this.expandTag(tag) });
    }
  }

  static async load(
    assets: AssetManager,
    jsonPath: string,
    imagePath?: string,
  ): Promise<AsepriteSpriteSheet> {
    const data = await assets.loadJson<AsepriteSheetData>(jsonPath);
    const resolvedImagePath = imagePath ?? AsepriteSpriteSheet.siblingPath(jsonPath, data.meta.image);
    const texture = await assets.loadTexture(resolvedImagePath);

    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;

    return new AsepriteSpriteSheet(texture, data);
  }

  createSprite(options: AsepriteSpriteOptions = {}): AsepriteSprite {
    return new AsepriteSprite(this, options);
  }

  getAnimation(name: string): readonly number[] {
    const animation = this.animations.get(name);
    if (!animation) {
      const available = [...this.animations.keys()].join(', ');
      throw new Error(`Unknown Aseprite animation "${name}". Available animations: ${available}`);
    }
    return animation.frames;
  }

  private expandTag(tag: AsepriteFrameTag): number[] {
    if (tag.from < 0 || tag.to >= this.frames.length || tag.from > tag.to) {
      throw new Error(`Aseprite animation "${tag.name}" has an invalid frame range`);
    }

    const forward = Array.from({ length: tag.to - tag.from + 1 }, (_, index) => tag.from + index);
    if (tag.direction === 'reverse') return forward.reverse();
    if (tag.direction === 'pingpong' && forward.length > 1) {
      return [...forward, ...forward.slice(1, -1).reverse()];
    }
    if (tag.direction === 'pingpong_reverse' && forward.length > 1) {
      const reverse = [...forward].reverse();
      return [...reverse, ...reverse.slice(1, -1).reverse()];
    }
    return forward;
  }

  private static siblingPath(jsonPath: string, imageName: string): string {
    const normalized = jsonPath.replaceAll('\\', '/');
    const lastSlash = normalized.lastIndexOf('/');
    return lastSlash < 0 ? imageName : `${normalized.slice(0, lastSlash + 1)}${imageName}`;
  }
}

/** A camera-facing Three.js sprite driven by Aseprite frame durations and tags. */
export class AsepriteSprite extends Sprite {
  private readonly frameTexture: Texture;
  private readonly pixelsPerUnit: number;
  private animation: readonly number[] = [];
  private animationName = '';
  private animationFrame = 0;
  private elapsedMilliseconds = 0;
  private playing: boolean;

  constructor(
    private readonly sheet: AsepriteSpriteSheet,
    options: AsepriteSpriteOptions = {},
  ) {
    const frameTexture = sheet.texture.clone();
    frameTexture.needsUpdate = true;
    super(new SpriteMaterial({ map: frameTexture, transparent: true }));

    this.frameTexture = frameTexture;
    this.pixelsPerUnit = options.pixelsPerUnit ?? 16;
    if (this.pixelsPerUnit <= 0) throw new Error('pixelsPerUnit must be greater than zero');
    this.playing = options.autoplay ?? true;
    this.play(options.animation ?? 'all', true);
  }

  get currentAnimation(): string {
    return this.animationName;
  }

  play(name: string, restart = false): void {
    if (!restart && name === this.animationName) {
      this.playing = true;
      return;
    }

    this.animation = this.sheet.getAnimation(name);
    this.animationName = name;
    this.animationFrame = 0;
    this.elapsedMilliseconds = 0;
    this.playing = true;
    this.applyFrame();
  }

  pause(): void {
    this.playing = false;
  }

  update(deltaSeconds: number): void {
    if (!this.playing || this.animation.length < 2 || deltaSeconds <= 0) return;

    this.elapsedMilliseconds += deltaSeconds * 1000;
    let duration = this.currentFrame().duration;
    while (this.elapsedMilliseconds >= duration) {
      this.elapsedMilliseconds -= duration;
      this.animationFrame = (this.animationFrame + 1) % this.animation.length;
      this.applyFrame();
      duration = this.currentFrame().duration;
    }
  }

  dispose(): void {
    this.material.dispose();
    this.frameTexture.dispose();
  }

  private currentFrame(): AsepriteFrameData {
    return this.sheet.frames[this.animation[this.animationFrame]];
  }

  private applyFrame(): void {
    const frame = this.currentFrame();
    const sheetSize = this.sheet.data.meta.size;

    this.frameTexture.repeat.set(frame.frame.w / sheetSize.w, frame.frame.h / sheetSize.h);
    this.frameTexture.offset.set(
      frame.frame.x / sheetSize.w,
      1 - (frame.frame.y + frame.frame.h) / sheetSize.h,
    );

    this.scale.set(
      frame.sourceSize.w / this.pixelsPerUnit,
      frame.sourceSize.h / this.pixelsPerUnit,
      1,
    );

    // Keep the character's feet anchored when frames have different heights.
    this.center.set(0.5, 0);
  }
}
