import {
  APISelectMenuComponent,
  SelectMenuBuilder,
  SelectMenuInteraction,
} from 'discord.js';
import { ConstructorDataType, createData, FrameType } from './common';

export default abstract class SelectMenu {
  readonly type = 'SELECT_MENU';
  data: APISelectMenuComponent;
  private readonly __onToJSON: () => void;
  constructor(data: ConstructorDataType<APISelectMenuComponent>) {
    const { data: jsonData, onToJSON } = createData<
      APISelectMenuComponent,
      typeof this
    >({
      self: this,
      data,
      Builder: SelectMenuBuilder,
      frame: this.__frame,
      omitCustomId: 'url' in data,
    });
    this.data = jsonData;
    this.__onToJSON = onToJSON;
  }
  abstract handle(interaction: SelectMenuInteraction<'cached'>): Promise<void>;
  toJSON() {
    this.__onToJSON();
    return this.data;
  }
  private get __frame(): FrameType<typeof this> | undefined {
    return undefined;
  }
}
