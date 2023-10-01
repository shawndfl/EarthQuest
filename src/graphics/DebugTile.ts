import vec3 from "../math/vec3";
import vec4 from "../math/vec4";
import { GlBuffer } from "./GlBuffer";

export class DebugTile {
    buffer: GlBuffer;
    points: vec3[];
    constructor(private gl: WebGL2RenderingContext) {
        this.buffer = new GlBuffer(gl);
    }

    initialize(points: vec3, color: vec4) {
        if (this.buffer) {
            this.buffer.dispose();
        }

        this.buffer.createBuffer()

    }
}