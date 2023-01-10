import {
  APIStringSelectComponent,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { ConstructorDataType, createData, FrameType } from './common';

export default abstract class SelectMenu {
  readonly type = 'SELECT_MENU';
  data: APIStringSelectComponent;
  private readonly __onToJSON: () => void;
  constructor(data: ConstructorDataType<APIStringSelectComponent>) {
    const { data: jsonData, onToJSON } = createData<
      APIStringSelectComponent,
      typeof this
    >({
      self: this,
      data,
      Builder: StringSelectMenuBuilder,
      frame: this.__frame,
      omitCustomId: 'url' in data,
    });
    this.data = jsonData;
    this.__onToJSON = onToJSON;
  }
  abstract handle(
    interaction: StringSelectMenuInteraction<'cached'>
  ): Promise<void>;
  toJSON() {
    this.__onToJSON();
    return this.data;
  }
  private get __frame(): FrameType<typeof this> | undefined {
    return undefined;
  }
}
