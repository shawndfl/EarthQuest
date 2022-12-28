import * as vec2 from '../math/vec2'
import * as vec4 from '../math/vec4'

/**
 * This describes a model data used by a TextController
 */
export interface ITextModel {
    /** The text for the FontController */
    text: string;

    /** The xy position float[2] */
    position: number[];

    /** The RGBA color float[3] */
    color: number[];
}
