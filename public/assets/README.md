# Game assets

Files in this directory are served unchanged at `assets/` by Vite.

- `data/` — JSON data and sprite metadata
- `images/` — PNG textures and sprite sheets
- `audio/` — sound effects and music

Load paths relative to this directory through `assetManager`, for example:

```ts
import { assetManager } from '../../src/assets';

const characterData = await assetManager.loadJson('data/character.json');
const characterTexture = await assetManager.loadTexture('images/character.png');
const hitSound = await assetManager.loadSound('audio/hit.ogg');
```
