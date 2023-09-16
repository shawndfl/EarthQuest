import { EditorComponent } from "./EditorComponent";
import { IEditor } from "./IEditor";

export class TileItem extends EditorComponent {

    type: string;
    imageId: string;
    options: string[];

    constructor(editor: IEditor) {
        super(editor)
        this.options = [];
    }

    async initialize(): Promise<void> {
        await this.buildHtml();
    }

    async buildHtml(): Promise<void> {
        const image = document.createElement('canvas');

        /*
        const img = this.editor.tileBrowser.images[data.srcIndex].img;
        const x = data.sx;
        const y = data.sy;
        const w = data.srcWidth;
        const h = data.srcHeight;

        this.context.drawImage(img, x, y, w, h, screen.x + data.offsetX, screen.y + data.offsetY, w * 2, h * 2);
        image.
        */
    }
}