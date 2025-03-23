import '../css/TileBrowser.scss';
import { EditorComponent } from './EditorComponent';
import { Editor } from './Editor';
import { ILevelData } from '../environment/ILevelData';
import { ISpriteDataAndImage } from '../systems/AssetManager';
import { ITileTypeData, TileFactory } from '../systems/TileFactory';
import Edit from '../assets/editor/edit.svg';

/**
 * The selected tile
 */
export interface ITile {
  tileTypeData: ITileTypeData;
  spriteData: ISpriteDataAndImage;
}

export class TileBrowser extends EditorComponent {
  entityContainer: HTMLDivElement;
  list: HTMLDivElement;
  activeTile: number;
  editButton: HTMLElement;
  /**
   * List of tiles. Images, x, y, w, h, type info, etc.
   */
  tileList: ITile[];

  details: HTMLElement[];
  titles: HTMLElement[];

  /**
   * Selected id
   */
  selectedId: string;

  /**
   * Currently selected tile
   */
  get selectedItem(): ITile {
    const tile = this.tileList.find((t) => t.tileTypeData.id == this.selectedId);
    return tile;
  }

  constructor(editor: Editor) {
    super(editor);
    this.tileList = [];
    this.selectedId = null;
  }

  async initialize(): Promise<void> {}

  /**
   * Add a tile to the browser list
   * @param tileData
   */
  private addTileItem(tileTypeData: ITileTypeData, tileData: ISpriteDataAndImage) {
    const item = document.createElement('div');

    // gray out if no tile type
    if (!tileTypeData) {
      item.classList.add('grayscale');
    }
    item.classList.add('item');
    // Add data sets for tile data
    item.dataset.id = tileTypeData.id;

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
    imageContainer.append(tileData.image.cloneNode());
    imagePreview.append(imageContainer);
    itemContainer.append(imagePreview);

    // text block for tile type, sprite
    /*
    const textContainer = document.createElement('div');
    textContainer.classList.add('text');

    // tile type
    const tileText = document.createElement('div');
    tileText.classList.add('tile-text');
    tileText.innerHTML = tileTypeData.tileType;
    this.titles.push(tileText);
    textContainer.append(tileText);

    // sprite id
    const spriteText = document.createElement('div');
    spriteText.classList.add('sprite-text');
    spriteText.innerHTML = tileData.tileData.id;
    this.details.push(spriteText);
    textContainer.append(spriteText);
*/
    //itemContainer.append(textContainer);
    item.append(itemContainer);

    this.registerClick(item);
    this.list.append(item);
  }

  /**
   * Adjust the visible items in the list as it gets resized
   * @param width
   */
  updateItemList(width: number): void {
    const items = Array.from(this.list.children);
    if (width < 200) {
      for (let item of this.details) {
        item.classList.add('hidden');
      }
      for (let item of this.titles) {
        item.classList.add('hidden');
      }
    } else if (width < 300) {
      for (let item of this.details) {
        item.classList.add('hidden');
      }
      for (let item of this.titles) {
        item.classList.remove('hidden');
      }
    } else {
      for (let item of this.details) {
        item.classList.remove('hidden');
      }
      for (let item of this.titles) {
        item.classList.remove('hidden');
      }
    }
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
    this.titles = [];
    this.details = [];
    const levelData = level;

    // add in all the tiles form the level data
    const tileKeys = Object.keys(levelData.tiles);
    for (let i of tileKeys) {
      let tileTypeData = levelData.tiles[i];
      const spriteData = this.eng.assetManager.getImageFrom(tileTypeData.spriteId);
      if (!spriteData) {
        // error message is in getImageFrom()
        continue;
      }

      // add the item
      this.addTileItem(tileTypeData, spriteData);

      // set the selected to the first one that is not empty
      if (this.selectedId && tileTypeData.tileType != 'empty') {
        this.setSelected(i);
      }

      // add tile list
      this.tileList.push({ tileTypeData, spriteData });
    }
  }

  /**
   * Create the view for the tile browser
   */
  public buildHtml(): HTMLElement {
    this.entityContainer = document.createElement('div');
    this.entityContainer.classList.add('editor-tile-container');
    this.entityContainer.style.width = '300px';

    const container = document.createElement('div');
    container.classList.add('tile-list-container');

    this.list = document.createElement('div');
    this.list.classList.add('tile-list');

    container.append(this.list);

    this.editButton = document.createElement('button');
    this.editButton.classList.add('btn');
    const img = document.createElement('img');
    img.src = Edit;
    this.editButton.append(img);

    this.entityContainer.append(container, this.editButton);
    return this.entityContainer;
  }

  /**
   * Registers the click event for an item
   * @param item
   */
  registerClick(item: HTMLElement): void {
    item.addEventListener('click', (e: MouseEvent) => {
      const items = Array.from(this.list.getElementsByClassName('item')) as HTMLElement[];
      items.forEach((elem) => {
        if (elem != item) {
          elem.classList.remove('tile-item-selected');
        } else {
          this.selectedId = elem.dataset.id;
          item.classList.add('tile-item-selected');
        }
      });
    });
  }

  /**
   * Set the selected index
   * @param index
   */
  setSelected(id: string): void {
    const items = Array.from(this.list.getElementsByClassName('item')) as HTMLElement[];
    items.forEach((elem) => {
      if (elem.dataset.id != id) {
        elem.classList.remove('tile-item-selected');
      } else {
        this.selectedId = elem.dataset.id;
        elem.classList.add('tile-item-selected');
        console.debug('selected ', this.selectedItem);
      }
    });
  }
}
