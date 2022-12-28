import vec2 from '../math/vec2';
import vec4 from '../math/vec4';

/**
 * This is the model data that represents a quad
 */
export interface IQuadModel {
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
  vertBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;

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
  }

  /**
   * Creates the buffers
   */
  createBuffer() {
    this.dispose();
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
  setBuffers(quads: IQuadModel[], isStatic: boolean) {
    // Now create an array of positions for the square.
    const verts: number[] = [];
    const index: number[] = [];

    // check if we have buffer
    if (!this.vertBuffer || !this.indexBuffer) {
      this.createBuffer();
    }

    // reset counters
    this.indexCount = 0;

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
      verts.push(quad.min.x, quad.min.y, quad.depth);
      verts.push(quad.minTex.x, quad.minTex.y);

      verts.push(quad.max.x, quad.min.y, quad.depth);
      verts.push(quad.maxTex.x, quad.minTex.y);

      verts.push(quad.max.x, quad.max.y, quad.depth);
      verts.push(quad.maxTex.x, quad.maxTex.y);

      verts.push(quad.min.x, quad.max.y, quad.depth);
      verts.push(quad.minTex.x, quad.maxTex.y);

      index.push(this.indexCount + 0);
      index.push(this.indexCount + 1);
      index.push(this.indexCount + 3);

      index.push(this.indexCount + 1);
      index.push(this.indexCount + 2);
      index.push(this.indexCount + 3);

      this.indexCount += 6;
    });

    // Create a buffer for positions.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(verts),
      isStatic ? this.gl.STATIC_DRAW : this.gl.DYNAMIC_DRAW
    );

    // index buffer
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
      const numComponents = 3; // position x, y, z
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 5 * 4; // pos(x,y,x) + tex(u,v) * 4 byte float
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
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
      const stride = 5 * 4; // pos(x,y,x) + tex(u,v) * 4 byte float
      const offset = 3 * 4; // start after the position
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertBuffer);
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
    if (this.vertBuffer) {
      this.gl.deleteBuffer(this.vertBuffer);
      this.vertBuffer = 0;
    }

    if (this.indexBuffer) {
      this.gl.deleteBuffer(this.indexBuffer);
      this.indexBuffer = 0;
    }
  }

  draw() {}
}
