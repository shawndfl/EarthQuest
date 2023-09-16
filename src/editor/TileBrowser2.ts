import '../css/TileBrowser.scss';
import TileImage from '../assets/isometricTile.png';
import CharacterImage from '../assets/characters.png';
import { EditorComponent } from './EditorComponent';
import { Editor } from './Editor';
import editSvg from '../assets/svg/pen-to-square.svg'

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TileImageSrc {
  src: string;
  w: number;
  h: number;
}

/**
 * The loaded image with the tile's width and height
 */
export interface TileImageElement {
  img: HTMLImageElement;
  w: number;
  h: number;
}

export class TileBrowser2 extends EditorComponent {
  container: HTMLDivElement;
  list: HTMLDivElement;
  activeTile: number;

  constructor(editor: Editor) {
    super(editor);

  }

  async initialize(): Promise<void> {
    this.container = document.createElement('div');
    this.container.classList.add('tile-list-container');
    await this.createView();
  }

  /**
   * Create the view for the tile browser
   */
  private async createView(): Promise<void> {
    this.list = document.createElement('div');
    this.list.classList.add('tile-list');

    this.container.append(this.list);

    const listIds = this.eng.assetManager.getTileAssetList();

    for (let i = 0; i < listIds.length; i++) {
      const imgSrc = listIds[i];
      const tileData = await this.eng.assetManager.getImageFrom(imgSrc);
      if (tileData) {

        const item = document.createElement('div');
        item.classList.add('item');
        item.dataset.index = i.toString();

        const itemContainer = document.createElement('div');
        itemContainer.classList.add('tile-item-container');

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

        const textContainer = document.createElement('div');
        textContainer.classList.add('tile-text');
        textContainer.innerHTML = tileData.tileData.id;
        itemContainer.append(textContainer);

        const editContainer = document.createElement('div');
        editContainer.classList.add('item-edit');
        const editIcon = document.createElement('img');
        editIcon.src = editSvg;
        editContainer.append(editIcon);
        itemContainer.append(editContainer);

        item.append(itemContainer);

        this.registerClick(item);
        this.list.append(item);
      }
    }
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
          item.classList.add('tile-item-selected');
        }
      });

    })
  }
}
