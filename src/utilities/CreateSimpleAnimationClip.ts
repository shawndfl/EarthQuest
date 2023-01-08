import { ISpriteData } from '../graphics/ISpriteData';

/**
 * This will create a animation clip that can be modified manually after it is copied from the console window.
 */
export class CreateSimpleAnimationClip {
  static create(spriteData: ISpriteData[]) {
    let clip: { id: string; frame: number }[] = [];
    let frame = 0;
    const frameStep = 15; //  500 ms

    // put all the sprites in an animation clip
    spriteData.forEach((sprite) => {
      clip.push({
        id: sprite.id,
        frame: frame,
      });
      frame += frameStep;
    });

    // open the browser and copy this from the console and paste it into a new json file.
    console.debug('animation clip ', clip);
  }
}
