import '../css/TileBrowser.scss';
import { EditorComponent } from './EditorComponent';
import { Editor } from './Editor';
import { ILevelData } from '../environment/ILevelData';
import { ISpriteDataAndImage } from '../systems/AssetManager';
import { ITileTypeData, TileFactory } from '../systems/TileFactory';

/**
 * The selected tile
 */
export interface ITile {
  tileTypeData: ITileTypeData;
  spriteData: ISpriteDataAndImage;
}

export class TileBrowser2 extends EditorComponent {
  container: HTMLDivElement;
  list: HTMLDivElement;
  activeTile: number;

  /**
   * Seleced index
   */
  selectedIndex: number;

  /**
   * Currently selected tile
   */
  get selectedItem(): ITile {
    return this.tileList[this.selectedIndex];
  }

  /**
   * List of tiles. Images, x, y, w, h, type info, etc.
   */
  tileList: ITile[];

  constructor(editor: Editor) {
    super(editor);
    this.tileList = [];
    this.selectedIndex = -1;
    console.debug('selected ', this.selectedItem);
  }

  async initialize(): Promise<void> {
    this.container = document.createElement('div');
    this.container.classList.add('tile-list-container');
    await this.createView();
  }

  /**
   * Add a tile to the browser list
   * @param tileData 
   */
  private addTileItem(index: number, tileTypeData: ITileTypeData, tileData: ISpriteDataAndImage) {

    const item = document.createElement('div');

    // gray out if no tile type
    if (!tileTypeData) {
      item.classList.add('grayscale');
    }
    item.classList.add('item');
    item.dataset.index = index.toString();

    // set up the sprite preview
    const itemContainer = document.createElement('div');
    itemContainer.classList.add('tile-item-container');

    // image preview
    const imagePreview = document.createElement('div');
    imagePreview.classList.add('tile-preview');
    const imageContainer = document.createElement('div');
    imageContainer.style.width = tileData.tileData.loc[2].toString() + 'px';
    imageContainer.style.height = tileData.tileData.loc[3].toString() + 'px';
    tileData.image.style.marginLeft = '-' + tileData.tileData.loc[0].toString() + 'px';
    tileData.image.style.marginTop = '-' + tileData.tileData.loc[1].toString() + 'px';
    imageContainer.append(tileData.image);
    imagePreview.append(imageContainer);
    itemContainer.append(imagePreview);

    // text block for tile type, sprite
    const textContainer = document.createElement('div');
    textContainer.classList.add('text');

    // tile type
    const tileText = document.createElement('div');
    tileText.classList.add('tile-text');
    tileText.innerHTML = tileTypeData.tileType;
    textContainer.append(tileText);

    // sprite id
    const spriteText = document.createElement('div');
    spriteText.classList.add('sprite-text');
    spriteText.innerHTML = tileData.tileData.id;
    textContainer.append(spriteText);

    itemContainer.append(textContainer);
    item.append(itemContainer);

    this.registerClick(item);
    this.list.append(item);

  }

  /**
   * Clears the broswer list and add in the tiles from the level
   * @param level 
   */
  async refreshLevel(level: ILevelData): Promise<void> {
    const listIds = this.eng.assetManager.getTileAssetList();
    // recreate the list
    this.list.innerHTML = '';
    this.tileList = [];

    const levelData = level;

    // add in all the tiles form the level data
    for (let i = 0; i < levelData.tiles.length; i++) {
      let tile = levelData.tiles[i];

      // --- is a short cut to error.
      if (tile == '---' && !this.tileList.find((x) => x.tileTypeData.tileType == 'empty')) {
        tile = 'empty|empty|';
      }

      // get the tile data
      let tileTypeData = TileFactory.parseTile(tile);
      if (!tileTypeData) {
        console.error('invalid tile: \'' + tile + '\'' +
          ' Format should be <tile type>|<sprint id>|[option1,options2,...] ');
        continue;
      }

      tileTypeData.typeIndex = i;

      const spriteData = await this.eng.assetManager.getImageFrom(tileTypeData.spriteId);
      if (!spriteData) {
        // error message is in getImageFrom()
        continue;
      }

      // add the item
      this.addTileItem(this.tileList.length, tileTypeData, spriteData);

      // add tile list
      this.tileList.push({ tileTypeData, spriteData });
    }
  }

  /**
   * Create the view for the tile browser
   */
  private async createView(): Promise<void> {
    this.list = document.createElement('div');
    this.list.classList.add('tile-list');

    this.container.append(this.list);
  }

  /**
   * Registers the click event for an item
   * @param item 
   */
  registerClick(item: HTMLElement): void {
    item.addEventListener('click', (e: MouseEvent) => {
      const items = Array.from(this.list.getElementsByClassName('item'));
      items.forEach((it) => {
        if (it != item) {
          it.classList.remove('tile-item-selected')
        } else {
          this.selectedIndex = parseInt((it as HTMLElement).dataset?.index);
          item.classList.add('tile-item-selected');
          console.debug('selected ', this.selectedItem);
        }
      });

    })
  }
}
