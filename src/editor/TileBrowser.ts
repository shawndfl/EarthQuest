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
  infoElement: HTMLElement;

  private hideTimer: number;
  private displayNoneTimer: number;
  private overInfo: boolean;

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
    this.infoElement = document.createElement('div');
    this.infoElement.classList.add('tile-info');
    this.infoElement.classList.add('hidden');

    this.infoElement.addEventListener('mouseenter', (e: MouseEvent) => {
      if (this.hideTimer) {
        window.clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      this.overInfo = true;
    });

    this.infoElement.addEventListener('mouseleave', (e: MouseEvent) => {
      this.overInfo = false;
      this.hideInfo();
    });

    this.entityContainer = document.createElement('div');
    this.entityContainer.classList.add('editor-tile-container');
    this.entityContainer.style.width = '300px';
    this.entityContainer.addEventListener('mouseleave', (e: MouseEvent) => {
      if (!this.overInfo) {
        this.hideInfo();
      }
    });

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

    this.entityContainer.append(container, this.editButton, this.infoElement);
    return this.entityContainer;
  }

  /**
   * Registers the click event for an item
   * @param item
   */
  registerClick(item: HTMLElement): void {
    const [tilePreview] = item.getElementsByClassName('tile-preview');
    tilePreview?.addEventListener('mouseover', (e: MouseEvent) => {
      const items = Array.from(this.list.getElementsByClassName('item')) as HTMLElement[];
      items.forEach((elem) => {
        if (elem == item) {
          const padding = 15;
          const itemBounds = elem.getBoundingClientRect();
          // the parent of the info dialog
          const containerBounds = this.entityContainer.getBoundingClientRect();
          const deltaX = itemBounds.right - padding - containerBounds.x;
          const deltaY = itemBounds.bottom - padding - containerBounds.y;
          const x = deltaX;
          const y = deltaY;

          this.showInfo(elem.dataset.id, x, y);
        }
      });
    });

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
   * Add an item to the info dialog
   * @param title
   * @param value
   * @returns
   */
  private createInfoItem(title: string, value: string): HTMLElement {
    let titleElem = document.createElement('div');
    titleElem.classList.add('info-title');
    titleElem.innerText = title;

    const valueElem = document.createElement('div');
    valueElem.classList.add('info-value');
    valueElem.innerText = value;

    const container = document.createElement('div');
    container.classList.add('info-row');

    container.append(titleElem, valueElem);
    return container;
  }

  private showInfo(id: string, x: number, y: number): void {
    const typeData = this.tileList.find((t) => t.tileTypeData.id == id);
    if (!typeData) {
      return;
    }

    this.infoElement.style.display = 'block';

    this.infoElement.style.left = x.toString() + 'px';
    this.infoElement.style.top = y.toString() + 'px';

    this.infoElement.style.opacity = '1';
    this.infoElement.classList.remove('hidden');
    this.infoElement.innerHTML = '';

    this.infoElement.append(this.createInfoItem('id', typeData.tileTypeData.id));
    this.infoElement.append(this.createInfoItem('spriteId', typeData.tileTypeData.spriteId));
    this.infoElement.append(this.createInfoItem('type', typeData.tileTypeData.tileType));
    this.infoElement.append(this.createInfoItem('flipX', typeData.spriteData.tileData.flipX ? 'true' : 'false'));
    this.infoElement.append(this.createInfoItem('flipY', typeData.spriteData.tileData.flipY ? 'true' : 'false'));

    for (let i = 0; i < typeData.tileTypeData.flags?.length; i++) {
      if (typeData.tileTypeData.flags[i] && typeData.tileTypeData.flags[i].length > 0) {
        this.infoElement.append(this.createInfoItem('flag ' + i, typeData.tileTypeData.flags[i]));
      }
    }

    const bounds = this.infoElement.getBoundingClientRect();
    if (bounds.bottom > window.innerHeight) {
      const diff = bounds.bottom - window.innerHeight;

      this.infoElement.style.top = (y - diff).toString() + 'px';
    }

    // reset timers
    if (this.displayNoneTimer) {
      window.clearTimeout(this.displayNoneTimer);
      this.displayNoneTimer = null;
    }
    if (this.hideTimer) {
      window.clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    // timeout after 5 seconds
    //this.hideTimer = window.setTimeout(() => {
    //  this.hideInfo();
    //}, 5000);
  }

  private hideInfo(): void {
    this.infoElement.style.opacity = '0';
    this.overInfo = false;
    if (this.displayNoneTimer) {
      window.clearTimeout(this.displayNoneTimer);
      this.displayNoneTimer = null;
    }
    this.displayNoneTimer = window.setTimeout(() => (this.infoElement.style.display = 'none'), 500);
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
