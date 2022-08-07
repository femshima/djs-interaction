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
  }
  abstract handle(interaction: ModalSubmitInteraction<'cached'>): Promise<void>;
  toJSON() {
    if (!this.store)
      throw new InitializationError('Do not extend Button directly!');
    this.store.set(this.data.custom_id, this);

    return this.data;
  }
  private get store(): StoreAdapter<Modal> | undefined {
    return undefined;
  }
  private get idGen(): IDGen | undefined {
    return undefined;
  }
}
