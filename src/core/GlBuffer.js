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
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    // Now create an array of positions for the square.
    const positions = [
      -0.1, 0.1, 0.0, -0.1, -0.1, 0.0, 0.1, 0.1, 0.0, 0.1, -0.1, 0.0,
    ];

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
      position: this.buffer,
    };
  }

  draw() {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }
}
