import vec2 from '../math/vec2';
import vec4 from '../math/vec4';

/**
 * This is the model data that represents a quad
 */
export interface QuadModel {
  min: vec2;
  max: vec2;
  depth: number;
  minTex: vec2;
  maxTex: vec2;
  color: vec4;
}

/**
 * Creates a buffer of a quad.
 */
export class GlBuffer {
  buffer: WebGLBuffer;
  bufferTex: WebGLBuffer;
  indexBuffer: WebGLBuffer;

  /** @type {number} How many indices do we have */
  indexCount: number;
  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl
   */
  constructor(private gl: WebGL2RenderingContext) {
    /** @type {WebGLBuffer} position buffer */
    this.buffer = 0;

    /** @type {WebGLBuffer} texture buffer */
    this.bufferTex = 0;

    /** @type {WebGLBuffer} index buffer */
    this.indexBuffer = 0;

    /** @type {number} How many indices do we have */
    this.indexCount = 0;
  }

  /**
   * Create the buffer
   * @param {QuadModel[]} quads A array of quads that will be added to this buffer
   * @param {boolean} isStatic Is this buffer static
   * @returns
   */
  initBuffers(quads: QuadModel[], isStatic: boolean) {
    // Now create an array of positions for the square.
    const positions: number[] = [];
    const texture: number[] = [];
    const index: number[] = [];

    // reset counters
    this.indexCount = 0;

    //const positions = [
    // -0.1,  0.1, 0.0,
    // -0.1, -0.1, 0.0,
    //  0.1,  0.1, 0.0,
    //  0.1, -0.1, 0.0,
    //];

    //               Building a quad
    //
    //    Pos[-1, 1]                Texture [0,1]
    //   p0---------p1 (max)      p0 (min)----p1
    //   |        / |              |        / |
    //   |      /   |              |      /   |
    //   |    /     |              |    /     |
    //   |  /       |              |  /       |
    //   p3---------p2             p3---------p2 (max)
    //  (min)
    //
    quads.forEach((quad) => {
      positions.push(quad.min.x, quad.min.y, quad.depth);
      positions.push(quad.max.x, quad.min.y, quad.depth);
      positions.push(quad.max.x, quad.max.y, quad.depth);
      positions.push(quad.min.x, quad.max.y, quad.depth);

      texture.push(quad.minTex.x, quad.minTex.y);
      texture.push(quad.maxTex.x, quad.minTex.y);
      texture.push(quad.maxTex.x, quad.maxTex.y);
      texture.push(quad.minTex.x, quad.maxTex.y);

      index.push(this.indexCount + 0);
      index.push(this.indexCount + 1);
      index.push(this.indexCount + 3);

      index.push(this.indexCount + 1);
      index.push(this.indexCount + 2);
      index.push(this.indexCount + 3);

      this.indexCount += 6;
    });

    console.debug('pos ', positions);
    console.debug('tex ', texture);

    // Create a buffer for positions.
    this.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW
    );

    // texture buffer
    this.bufferTex = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferTex);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(texture),
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW
    );

    // index buffer
    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(index),
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW
    );
  }

  /**
   * Enable vertex attributes and element buffer
   * @param {number} positionAttribute
   * @param {number} textureAttribute
   */
  enable(positionAttribute: number, textureAttribute: number) {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.vertexAttribPointer(
        positionAttribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(positionAttribute);
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferTex);
      this.gl.vertexAttribPointer(
        textureAttribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(textureAttribute);
    }

    // Tell WebGL which indices to use to index the vertices
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  /**
   * Clean up buffer
   */
  dispose() {
    if (this.buffer) {
      this.gl.deleteBuffer(this.buffer);
      this.buffer = 0;
    }

    if (this.bufferTex) {
      this.gl.deleteBuffer(this.bufferTex);
      this.bufferTex = 0;
    }

    if (this.indexBuffer) {
      this.gl.deleteBuffer(this.indexBuffer);
      this.indexBuffer = 0;
    }
  }

  draw() {}
}
