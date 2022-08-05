import {
  APISelectMenuComponent,
  SelectMenuBuilder,
  SelectMenuInteraction,
} from 'discord.js';
import InitializationError from '../../error/InitializationError';
import StoreAdapter from '../../store/adapter';
import { IDGen } from '../../store/idgen';

export default abstract class SelectMenu {
  readonly type = 'SELECT_MENU';
  data: APISelectMenuComponent;
  constructor(data: Omit<APISelectMenuComponent, 'type' | 'custom_id'>) {
    if (!this.store || !this.idGen)
      throw new InitializationError('Do not extend SelectMenu directly!');
    const custom_id = this.idGen.generateID();
    this.data = new SelectMenuBuilder({ ...data, custom_id }).toJSON();
    this.store.set(this.data.custom_id, this);
  }
  abstract handle(interaction: SelectMenuInteraction<'cached'>): Promise<void>;
  toJSON() {
    return this.data;
  }
  get store(): StoreAdapter<SelectMenu> | undefined {
    return undefined;
  }
  get idGen(): IDGen | undefined {
    return undefined;
  }
}
