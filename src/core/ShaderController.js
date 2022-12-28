const vsSource = `
  attribute vec4 aVertexPosition;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  }
`;

// Fragment shader program

const fsSource = `
  void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
`;

/**
 * Manages one shader program
 */
export class ShaderController {
  constructor() {
    this.program;
  }

  /**
   * Initialize a shader program, so WebGL knows how to draw our data
   * @param {*} gl
   * @param {*} vsSource
   * @param {*} fsSource
   * @returns
   */
  initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = this._loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this._loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, vertexShader);
    gl.attachShader(this.shaderProgram, fragmentShader);
    gl.linkProgram(this.shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          this.shaderProgram
        )}`
      );
    }
  }

  /**
   * creates a shader of the given type, uploads the source and
   * compiles it.
   * @param {*} gl
   * @param {*} type
   * @param {*} source
   * @returns
   */
  _loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
          shader
        )}`
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
}
