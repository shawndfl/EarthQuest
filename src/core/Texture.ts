/**
 * OpenGL texture
 */
export class Texture {
  texture: WebGLTexture;
  texturePath: string;

  constructor(private gl: WebGL2RenderingContext) {
    this.texture = 0;
  }

  initialize(imagePath: string) {
    this.texturePath = imagePath;
    this.texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = this.gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = this.gl.RGBA;
    const srcType = this.gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      srcFormat,
      srcType,
      pixel
    );

    const image = new Image();
    image.onload = () => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        image
      );

      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
        // Yes, it's a power of 2. Generate mips.
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
      } else {
        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_S,
          this.gl.CLAMP_TO_EDGE
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_WRAP_T,
          this.gl.CLAMP_TO_EDGE
        );
        this.gl.texParameteri(
          this.gl.TEXTURE_2D,
          this.gl.TEXTURE_MIN_FILTER,
          this.gl.LINEAR
        );
      }
    };
    image.src = imagePath;
  }

  isPowerOf2(value: number) {
    return (value & (value - 1)) == 0;
  }
}
