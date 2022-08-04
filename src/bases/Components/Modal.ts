import {
  APIModalInteractionResponseCallbackData,
  ModalBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import InitializationError from '../../error/InitializationError';

interface Store {
  getUniqueKey(): string;
  set(key: string, value: Modal): void;
}

export default abstract class Modal {
  readonly type = 'MODAL';
  data: APIModalInteractionResponseCallbackData;
  constructor(
    data: Omit<APIModalInteractionResponseCallbackData, 'type' | 'custom_id'>
  ) {
    if (!this.store)
      throw new InitializationError('Do not extend Modal directly!');
    const custom_id = this.store.getUniqueKey();
    this.data = new ModalBuilder({ ...data, custom_id }).toJSON();
    this.store.set(this.data.custom_id, this);
  }
  abstract handle(interaction: ModalSubmitInteraction<'cached'>): Promise<void>;
  toJSON() {
    return this.data;
  }
  get store(): Store | undefined {
    return undefined;
  }
}
