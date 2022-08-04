import {
  APISelectMenuComponent,
  SelectMenuBuilder,
  SelectMenuInteraction,
} from 'discord.js';
import InitializationError from '../../error/InitializationError';

interface Store {
  getUniqueKey(): string;
  set(key: string, value: SelectMenu): void;
}

export default abstract class SelectMenu {
  readonly type = 'SELECT_MENU';
  data: APISelectMenuComponent;
  constructor(data: Omit<APISelectMenuComponent, 'type' | 'custom_id'>) {
    if (!this.store)
      throw new InitializationError('Do not extend SelectMenu directly!');
    const custom_id = this.store.getUniqueKey();
    this.data = new SelectMenuBuilder({ ...data, custom_id }).toJSON();
    this.store.set(this.data.custom_id, this);
  }
  abstract handle(interaction: SelectMenuInteraction<'cached'>): Promise<void>;
  toJSON() {
    return this.data;
  }
  get store(): Store | undefined {
    return undefined;
  }
}
