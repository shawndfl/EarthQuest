import { Component } from '../components/Component';
import { PlayerComponent } from './PlayerComponent';

export enum ComponentTypes {
  player = 'player',
  npc = 'npc',
  collision = 'collision',
}

export class TileComponentFactory extends Component {
  /**
   * Create components from the meta data.
   * @param data
   * @returns
   */
  public createComponents(data: { [loc: string]: string }): { [loc: string]: Component } {
    const dataKeys = Object.keys(data);
    const components: { [loc: string]: Component } = {};
    for (let key of dataKeys) {
      const [i, j, k, i2, j2] = key.split(',').map((i) => Number.parseFloat(i));
      components[key] = this.createComponent(data[key].split(','));
    }
    return components;
  }

  private createComponent(options: string[]): Component {
    const type = options[0];
    switch (type) {
      case 'player':
        return new PlayerComponent(this.eng);
    }
  }
}
