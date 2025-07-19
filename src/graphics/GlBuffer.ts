export interface Geometry {
  verts: Float32Array;
  indices: Uint16Array;
}

/**
 * Creates and manages opengl vertex array buffer and the vertex/index buffers that go with it.
 */
export class GlBuffer {
  vertBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  vertArrayBuffer: WebGLVertexArrayObject;

  /** were the buffers created */
  get buffersCreated() {
    return this.vertArrayBuffer != 0;
  }

  /** @type {number} How many indices do we have */
  indexCount: number;

  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl
   */
  constructor(private gl: WebGL2RenderingContext) {
    this.vertBuffer = 0;
    this.indexBuffer = 0;
    this.indexCount = 0;
    this.vertArrayBuffer = 0;
  }

  /**
   * Creates the buffers
   */
  private createBuffer() {
    this.dispose();
    // create vert array buffer
    this.vertArrayBuffer = this.gl.createVertexArray();
    // position buffer
    this.vertBuffer = this.gl.createBuffer();
    // index buffer
    this.indexBuffer = this.gl.createBuffer();
  }

  /**
   * Create the buffer
   * @param quads A array of quads that will be added to this buffer
   * @param isStatic Is this buffer static
   * @returns
   */
  setBuffers(geo: Geometry, isStatic: boolean = true, bufferIndex: number = 0) {
    const { verts, indices } = geo;
    // check if we have buffer
    if (!this.vertBuffer || !this.indexBuffer) {
      this.createBuffer();
    }

    // reset counters
    this.indexCount = indices.length;

    // bind the array buffer
    this.gl.bindVertexArray(this.vertArrayBuffer);

    // Create a buffer for positions.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      verts,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex,
      verts.length
    );

    // in order for this to work the vertex shader will
    // need to have position
    //  vec3 aPos;
    //  vec2 aTex;
    //  float aHueAngle;
    //  float aAlpha
    //
    const positionAttribute = 0;
    const textureAttribute = 1;
    const hueAttribute = 2;
    const alphaAttribute = 3;

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3; // position x, y, z
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 7 * 4; // pos(x,y,x) + tex(u,v) + hua + alpha * 4 byte float
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
      this.gl.vertexAttribPointer(positionAttribute, numComponents, type, normalize, stride, offset);
      this.gl.enableVertexAttribArray(positionAttribute);
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 7 * 4; // pos(x,y,x) + tex(u,v) + hua + alpha * 4 byte float
      const offset = 3 * 4; // start after the position
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
      this.gl.vertexAttribPointer(textureAttribute, numComponents, type, normalize, stride, offset);
      this.gl.enableVertexAttribArray(textureAttribute);
    }

    // the hue rotation attribute
    {
      const numComponents = 1;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 7 * 4; // pos(x,y,x) + tex(u,v) + hua + alpha * 4 byte float
      const offset = 5 * 4; // start after the texture
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
      this.gl.vertexAttribPointer(hueAttribute, numComponents, type, normalize, stride, offset);
      this.gl.enableVertexAttribArray(hueAttribute);
    }

    {
      const numComponents = 1;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 7 * 4; // pos(x,y,x) + tex(u,v) + hua + alpha * 4 byte float
      const offset = 6 * 4; // start after the hue
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
      this.gl.vertexAttribPointer(alphaAttribute, numComponents, type, normalize, stride, offset);
      this.gl.enableVertexAttribArray(alphaAttribute);
    }

    // index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      indices,
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW,
      bufferIndex,
      this.indexCount
    );
  }

  /**
   * Enable vertex attributes and element buffer
   */
  enable() {
    if (!this.buffersCreated) {
      console.error('buffers were not created!');
    } else {
      // the vertex and index buffer are grouped with this so we only need
      // to enable this array buffer
      this.gl.bindVertexArray(this.vertArrayBuffer);
    }
  }

  /**
   * Clean up buffer
   */
  dispose() {
    if (this.vertBuffer) {
      this.gl.deleteBuffer(this.vertBuffer);
      this.vertBuffer = 0;
    }

    if (this.indexBuffer) {
      this.gl.deleteBuffer(this.indexBuffer);
      this.indexBuffer = 0;
    }

    if (this.vertArrayBuffer) {
      this.gl.deleteVertexArray(this.vertArrayBuffer);
    }
  }
}
