import {
  APIModalInteractionResponseCallbackData,
  ModalBuilder,
  ModalSubmitInteraction,
} from 'discord.js';
import { ConstructorDataType, createData, FrameType } from './common';

export default abstract class Modal {
  readonly type = 'MODAL';
  data: APIModalInteractionResponseCallbackData;
  private readonly __onToJSON: () => void;
  constructor(
    data: ConstructorDataType<APIModalInteractionResponseCallbackData>
  ) {
    const { data: jsonData, onToJSON } = createData<
      APIModalInteractionResponseCallbackData,
      typeof this
    >({
      self: this,
      data,
      Builder: ModalBuilder,
      frame: this.__frame,
    });
    this.data = jsonData;
    this.__onToJSON = onToJSON;
  }
  abstract handle(interaction: ModalSubmitInteraction<'cached'>): Promise<void>;
  toJSON() {
    this.__onToJSON();
    return this.data;
  }
  private get __frame(): FrameType<typeof this> | undefined {
    return undefined;
  }
}
