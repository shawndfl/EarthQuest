/**
 * Creates a buffer of a quad.
 */
export class GlBuffer {
  /**
   * Vertex buffer
   */
  buffer;

  constructor() {
    this.buffer = undefined;
  }

  /**
   * Create the buffer
   * @param {*} gl
   * @returns
   */
  initBuffers(gl) {
    // Create a buffer for the square's positions.
    this.buffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now create an array of positions for the square.
    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, 0.0];

    return {
      position: positionBuffer,
    };
  }

  draw() {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }
}
