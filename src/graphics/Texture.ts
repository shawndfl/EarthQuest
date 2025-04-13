/**
 * OpenGL texture
 */
export class Texture {
  glTexture: WebGLTexture;
  texturePath: string;
  width: number;
  height: number;
  level: number;
  internalFormat: number;
  border: number;
  srcFormat: number;
  srcType: number;

  constructor(private gl: WebGL2RenderingContext) {
    this.glTexture = 0;
  }

  /**
   * Enable this texture, activate the texture and set the uniform for the shader
   */
  enable(uniformIndex: number, slot: number = 0, activeTexture: GLenum = this.gl.TEXTURE0) {
    // Tell WebGL we want to affect texture unit
    this.gl.activeTexture(activeTexture);

    // Bind the texture to texture unit 0
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);

    // Tell the shader we bound the texture to texture unit
    this.gl.uniform1i(uniformIndex, slot);
  }

  initializePixel(): void {
    this.glTexture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    this.level = 0;
    this.internalFormat = this.gl.RGBA;
    this.width = 1;
    this.height = 1;
    this.border = 0;
    this.srcFormat = this.gl.RGBA;
    this.srcType = this.gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      this.level,
      this.internalFormat,
      this.width,
      this.height,
      this.border,
      this.srcFormat,
      this.srcType,
      pixel
    );

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
  }

  /**
   * Updates the texture with an already loaded image
   * @param image
   */
  updateTexture(image: TexImageSource): void {
    if (this.glTexture == 0) {
      this.initializePixel();
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, this.level, this.internalFormat, this.srcFormat, this.srcType, image);

    this.gl.generateMipmap(this.gl.TEXTURE_2D);
  }

  /**
   * load an image from a path
   * @param imagePath
   * @returns
   */
  async loadImage(imagePath: string): Promise<HTMLImageElement> {
    if (this.glTexture == 0) {
      this.initializePixel();
    }
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.width = image.width;
        this.height = image.height;
        this.updateTexture(image);
        return resolve(image);
      };
      image.onerror = (event: string) => {
        console.error(event);
        return reject();
      };
      image.src = imagePath;
    });
  }

  isPowerOf2(value: number) {
    return (value & (value - 1)) == 0;
  }

  dispose(): void {
    this.gl.deleteTexture(this.glTexture);
    this.glTexture = null;
  }
}
