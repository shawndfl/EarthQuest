import { TextReturn, TextTab } from './DialogComponent';

export interface TextIteratorResult {
  character: string;
  pauseForUser?: boolean;
  Options: string[];
}

/**
 * Text iterator will display characters of the text one by one.
 * It will pause for two reason. One, wait for the user to acknowledge
 * the text, Second, to select an option.
 */
export class TextIterator {
  private index: number;
  private acknowledged: boolean;
  private waitForAcknowledge: boolean;
  private text: string;

  initialize(text: string): void {
    this.index = 0;
    this.acknowledged = false;
    this.waitForAcknowledge = false;
    this.text = text;
  }

  /**
   * Tells the iterator that the user acknowledged the text
   */
  acknowledge(): void {
    this.acknowledged = true;
  }

  isDone(): boolean {
    return !this.text || this.index >= this.text.length;
  }

  /**
   * Next character or it may go into a acknowledge state
   * @returns
   */
  next(): TextIteratorResult {
    // return null when done
    if (!this.text || this.index >= this.text.length) {
      return null;
    }

    if (this.waitForAcknowledge && !this.acknowledged) {
      return {
        character: null,
        Options: [],
        pauseForUser: true,
      };
    }

    // The user is just hitting the acknowledge button
    // and there is nothing to acknowledge then just skip to the end of the text
    if (this.acknowledged && !this.waitForAcknowledge) {
      const endIndex = this.text.indexOf('\n', this.index);
      if (endIndex != -1) {
        const text = this.text.substring(this.index, endIndex + 1);
        this.index += text.length;
        this.waitForAcknowledge = false;
        this.acknowledged = false;
        return {
          character: text,
          Options: [],
        };
      }
    }

    // reset flags
    this.waitForAcknowledge = false;
    this.acknowledged = false;

    // get the next character
    let char = this.text[this.index];
    // this will require the user just to acknowledge the text
    if (char == TextReturn) {
      this.index++;
      this.waitForAcknowledge = true;
      return {
        character: char,
        Options: [],
      };
    }
    // this will require the user to select an option
    else if (char == TextTab) {
      const options = [];
      // collect all options
      while (char == TextTab) {
        this.index++; // eat tab
        let endIndex = this.text.indexOf('\n', this.index);
        if (endIndex == -1) {
          endIndex = this.text.length;
        }
        const option = this.text.substring(this.index, endIndex);
        options.push(option);
        this.index += option.length + 1; // eat option and new line
        char = this.text[this.index];
      }
      this.waitForAcknowledge = true;
      return {
        character: '',
        Options: options,
      };
    }

    this.index++; // eat character
    // normal character
    return {
      character: char,
      Options: [],
    };
  }
}
