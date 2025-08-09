import { Component } from '../core/Component';
import { GlBuffer } from '../graphics/GlBuffer';
import { Line, Quad, QuadGeometry } from '../graphics/QuadGeometry';
import rect from '../math/rect';
import vec3 from '../math/vec3';
import vec4 from '../math/vec4';
import { ColorShader } from '../shaders/ColorShader';

export class DebugHelpers extends Component {
  protected _buffer: GlBuffer;
  protected _shader: ColorShader;
  protected _refreshRequired: boolean;

  // debug things
  protected _rects: rect[];
  protected _arrows: Line[];

  // used for creating the vertex buffer
  protected _lines: Map<string, Line> = new Map();

  initialize(): void {
    this._buffer = new GlBuffer(this.gl);
    this._shader = new ColorShader(this.gl, 'colorShader');
  }

  setLine(id: string, start: vec3, end: vec3, color: vec4): void {
    this._lines.set(id, { start, end, color });
    this._refreshRequired = true;
  }

  setRect(id: string, rect: rect, color: vec4): void {
    const p0 = new vec3(rect.left, rect.top, 0);
    const p1 = new vec3(rect.right, rect.top, 0);
    const p2 = new vec3(rect.right, rect.top - rect.height, 0);
    const p3 = new vec3(rect.left, rect.top - rect.height, 0);

    this._lines.set(id + ':top', { start: p0, end: p1, color });
    this._lines.set(id + ':right', { start: p1, end: p2, color });
    this._lines.set(id + ':bottom', { start: p2, end: p3, color });
    this._lines.set(id + ':left', { start: p3, end: p0, color });
    this._refreshRequired = true;
  }

  closeLevel(): void {
    //TODO
  }

  updateBuffers(): void {
    if (this._refreshRequired) {
      const geo = QuadGeometry.createLineArray(Array.from(this._lines.values()));
      this._buffer.setColorBuffers(geo);
    }
  }

  update(dt: number): void {
    if (this._refreshRequired) {
      this.updateBuffers();
      this._refreshRequired = false;
    }

    if (this._buffer.buffersCreated) {
      this._shader.enable();

      const proj = this.eng.viewManager.projection;

      this._shader.setProj(proj);
      this._buffer.enable();

      const count = this._buffer.indexCount;
      const type = this.gl.UNSIGNED_SHORT;
      const offset = 0;

      this.gl.depthFunc(this.gl.ALWAYS);
      this.gl.drawArrays(this.gl.LINES, offset, count);
      this.gl.depthFunc(this.gl.LEQUAL);
    }
  }
}
