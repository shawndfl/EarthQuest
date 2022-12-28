import * as vec3 from '../math/vec3';
import * as vec2 from '../math/vec2';
import * as vec4 from '../math/vec4';

/**
 * This is the model data that represents a quad
 */
export class QuadModel {
  constructor() {
    /** @type {vec2} min position range is (-1,-1) to (1,1) */
    this.min = new vec2.create();
    /** @type {vec2} max position range is (-1,-1) to (1,1) */
    this.max = new vec2.create();
    /** @type {number} the depth 1 is in front -1 is behind */
    this.depth = 0.0;
    /** @type {vec2} min texture coordinate (0,0) to (1,1) */
    this.minTex = new vec2.create();
    /** @type {vec2} max texture coordinate (0,0) to (1,1) */
    this.maxTex = new vec2.create();
    /** @type {vec4} color RGBA */
    this.color = new vec4.create();
  }
}

/**
 * Creates a buffer of a quad.
 */
export class GlBuffer {
  /**
   * Constructor
   * @param {WebGL2RenderingContext} gl
   */
  constructor(gl) {
    /** @type {WebGLBuffer} position buffer */
    this.buffer = 0;

    /** @type  {WebGL2RenderingContext} gl object*/
    this.gl = gl;

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
  initBuffers(quads, isStatic) {
    // Now create an array of positions for the square.
    const positions = [];
    const texture = [];
    const index = [];

    // reset counters
    this.indexCount = 0;
    this.positionCount = 0;

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
      positions.push(quad.min[0], quad.max[1], quad.depth);
      positions.push(quad.max[0], quad.max[1], quad.depth);
      positions.push(quad.max[0], quad.min[1], quad.depth);
      positions.push(quad.min[0], quad.min[1], quad.depth);

      texture.push(quad.minTex[0], quad.minTex[1]);
      texture.push(quad.maxTex[0], quad.minTex[1]);
      texture.push(quad.maxTex[0], quad.maxTex[1]);
      texture.push(quad.minTex[0], quad.maxTex[1]);

      index.push(this.indexCount + 0);
      index.push(this.indexCount + 1);
      index.push(this.indexCount + 3);

      index.push(this.indexCount + 1);
      index.push(this.indexCount + 2);
      index.push(this.indexCount + 3);

      this.indexCount += 4;
    });

    console.debug('pos ', positions);
    console.debug('tex ', texture);

    // Create a buffer for positions.
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW
    );

    // texture buffer
    this.bufferTex = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTex);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW
    );

    // index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(this.indexBuffer),
      isStatic ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW
    );
  }

  /**
   * Enable vertex attributes and element buffer
   * @param {number} positionAttribute
   * @param {number} textureAttribute
   */
  enable(positionAttribute, textureAttribute) {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      this.gl.vertexAttribPointer(
        positionAttribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition
      );
    }

    // Tell WebGL how to pull out the texture coordinates from
    // the texture coordinate buffer into the textureCoord attribute.
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferTex);
      this.gl.vertexAttribPointer(
        textureAttribute,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    }

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
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
