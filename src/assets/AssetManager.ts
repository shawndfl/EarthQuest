import { Texture, TextureLoader } from 'three';

type CachedAsset = AudioBuffer | Texture | unknown;

/** Loads and caches game assets served from Vite's public/assets directory. */
export class AssetManager {
  private readonly cache = new Map<string, CachedAsset>();
  private readonly pending = new Map<string, Promise<CachedAsset>>();
  private readonly textureLoader = new TextureLoader();
  private audioContext?: AudioContext;

  constructor(private readonly baseUrl = `${import.meta.env.BASE_URL}assets/`) {}

  loadJson<T>(path: string): Promise<T> {
    return this.load(`json:${path}`, async () => {
      const response = await fetch(this.resolve(path));
      if (!response.ok) {
        throw new Error(`Could not load JSON asset "${path}" (${response.status} ${response.statusText})`);
      }

      return response.json() as Promise<T>;
    });
  }

  loadTexture(path: string): Promise<Texture> {
    return this.load(`texture:${path}`, () => this.textureLoader.loadAsync(this.resolve(path)));
  }

  loadSound(path: string): Promise<AudioBuffer> {
    return this.load(`sound:${path}`, async () => {
      const response = await fetch(this.resolve(path));
      if (!response.ok) {
        throw new Error(`Could not load sound asset "${path}" (${response.status} ${response.statusText})`);
      }

      return this.getAudioContext().decodeAudioData(await response.arrayBuffer());
    });
  }

  /** Returns a previously loaded asset, or undefined if it has not finished loading. */
  get<T>(type: 'json' | 'sound' | 'texture', path: string): T | undefined {
    return this.cache.get(`${type}:${path}`) as T | undefined;
  }

  has(type: 'json' | 'sound' | 'texture', path: string): boolean {
    return this.cache.has(`${type}:${path}`);
  }

  /** Removes one asset from the cache and releases GPU memory used by textures. */
  unload(type: 'json' | 'sound' | 'texture', path: string): void {
    const key = `${type}:${path}`;
    const asset = this.cache.get(key);
    if (asset instanceof Texture) asset.dispose();
    this.cache.delete(key);
    this.pending.delete(key);
  }

  /** Clears all cached assets and releases resources owned by the manager. */
  dispose(): void {
    for (const asset of this.cache.values()) {
      if (asset instanceof Texture) asset.dispose();
    }
    this.cache.clear();
    this.pending.clear();
    void this.audioContext?.close();
    this.audioContext = undefined;
  }

  private load<T extends CachedAsset>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached !== undefined) return Promise.resolve(cached as T);

    const existing = this.pending.get(key);
    if (existing) return existing as Promise<T>;

    const request = loader()
      .then((asset) => {
        this.cache.set(key, asset);
        this.pending.delete(key);
        return asset;
      })
      .catch((error: unknown) => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, request);
    return request;
  }

  private resolve(path: string): string {
    const relativePath = path.replace(/^[/\\]+/, '');
    if (relativePath.split(/[\\/]/).includes('..')) {
      throw new Error(`Asset paths cannot leave the asset directory: "${path}"`);
    }
    return `${this.baseUrl.replace(/\/?$/, '/')}${relativePath}`;
  }

  private getAudioContext(): AudioContext {
    this.audioContext ??= new AudioContext();
    return this.audioContext;
  }
}

export const assetManager = new AssetManager();
