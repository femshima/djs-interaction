import {
  APIModalInteractionResponseCallbackData,
  ModalBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import InitializationError from '../../error/InitializationError';
import StoreAdapter from '../../store/adapter';
import { IDGen } from '../../store/idgen';

export default abstract class Modal {
  readonly type = 'MODAL';
  data: APIModalInteractionResponseCallbackData;
  constructor(
    data: Omit<APIModalInteractionResponseCallbackData, 'type' | 'custom_id'>
  ) {
    if (!this.store || !this.idGen)
      throw new InitializationError('Do not extend Modal directly!');
    const custom_id = this.idGen.generateID();
    this.data = new ModalBuilder({ ...data, custom_id }).toJSON();
    this.store.set(this.data.custom_id, this);
  }
  abstract handle(interaction: ModalSubmitInteraction<'cached'>): Promise<void>;
  toJSON() {
    return this.data;
  }
  get store(): StoreAdapter<typeof this> | undefined {
    return undefined;
  }
  get idGen(): IDGen | undefined {
    return undefined;
  }
}
