/**
 * Manages one shader program
 */
export class ShaderController {
  /**
   * Creates the shader controller
   * @param {WebGL2RenderingContext} gl GL Context
   * @param {string} shaderName The name of the shader. This is just a way to id different shader for debugging
   */
  constructor(gl, shaderName) {
    /** @type {WebGLProgram} The web gl program */
    this.program;
    /** @type {WebGL2RenderingContext} gl context */
    this.gl = gl;
    /** @type {string} The shader id */
    this.shaderName = shaderName;
  }

  /**
   * Initialize a shader program, so WebGL knows how to draw our data
   * @param {*} vsSource
   * @param {*} fsSource
   * @returns
   */
  initShaderProgram(vsSource, fsSource) {
    const vertexShader = this._loadShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this._loadShader(this.gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    this.shaderProgram = this.gl.createProgram();
    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);

    // If creating the shader program failed, alert
    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      console.error(
        `Unable to initialize the shader program: ${this.gl.getProgramInfoLog(
          this.shaderProgram
        )}`
      );
    }
  }

  /**
   * Get a shader attribute location
   * @param {string} name Name of the attribute
   * @return {number} The attribute location
   */
  getAttribute(name) {
    const loc = this.gl.getAttribLocation(shaderProgram, name);
    if (loc == -1) {
      log.error(
        'can not find attribute: ' + name + ' in shader ' + this.shaderName
      );
    }
    return loc;
  }

  /**
   * Get a shader attribute location
   * @param {string} name Name of the attribute
   * @return {number} The attribute location
   */
  getUniform(name) {
    const loc = this.gl.getUniformLocation(shaderProgram, name);
    if (loc == -1) {
      log.error(
        'can not find uniform: ' + name + ' in shader ' + this.shaderName
      );
    }
    return loc;
  }

  /**
   * Enable the shader
   */
  enable() {
    // Tell WebGL to use our program when drawing
    this.gl.useProgram(this.program);
  }
  /**
   * creates a shader of the given type, uploads the source and
   * compiles it.
   * @param {*} gl
   * @param {*} type
   * @param {*} source
   * @returns
   */
  _loadShader(type, source) {
    const shader = this.gl.createShader(type);

    // Send the source to the shader object
    this.gl.shaderSource(shader, source);

    // Compile the shader program
    this.gl.compileShader(shader);

    // See if it compiled successfully
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(
        `An error occurred compiling the shaders: ${this.gl.getShaderInfoLog(
          shader
        )}`
      );
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
}
