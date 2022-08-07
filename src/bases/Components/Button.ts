import {
  APIButtonComponent,
  ButtonBuilder,
  ButtonInteraction,
} from 'discord.js';
import InitializationError from '../../error/InitializationError';
import StoreAdapter from '../../store/adapter';
import { IDGen } from '../../store/idgen';

type DistributiveOmit<T, K extends string | number | symbol> = T extends unknown
  ? Omit<T, K>
  : never;

export default abstract class Button {
  readonly type = 'BUTTON';
  data: APIButtonComponent;
  constructor(
    data: DistributiveOmit<APIButtonComponent, 'type' | 'custom_id'>
  ) {
    if (!this.store || !this.idGen)
      throw new InitializationError('Do not extend Button directly!');
    const custom_id = this.idGen.generateID();
    if ('url' in data) {
      this.data = new ButtonBuilder({ ...data }).toJSON();
    } else {
      this.data = new ButtonBuilder({ ...data, custom_id }).toJSON();
    }
  }
  handle?(interaction: ButtonInteraction<'cached'>): Promise<void>;
  toJSON() {
    if (!this.store)
      throw new InitializationError('Do not extend Button directly!');
    if ('custom_id' in this.data) {
      this.store.set(this.data.custom_id, this);
    }

    return this.data;
  }
  private get store(): StoreAdapter<Button> | undefined {
    return undefined;
  }
  private get idGen(): IDGen | undefined {
    return undefined;
  }
}
