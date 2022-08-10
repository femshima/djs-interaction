import {
  APIButtonComponent,
  ButtonBuilder,
  ButtonInteraction,
} from 'discord.js';
import { ConstructorDataType, createData, FrameType } from './common';

export default abstract class Button {
  readonly type = 'BUTTON';
  data: APIButtonComponent;
  private readonly __onToJSON: () => void;
  constructor(data: ConstructorDataType<APIButtonComponent>) {
    const { data: jsonData, onToJSON } = createData<
      APIButtonComponent,
      typeof this
    >({
      self: this,
      data,
      Builder: ButtonBuilder,
      frame: this.__frame,
      omitCustomId: 'url' in data,
    });
    this.data = jsonData;
    this.__onToJSON = onToJSON;
  }
  handle?(interaction: ButtonInteraction<'cached'>): Promise<void>;
  toJSON() {
    this.__onToJSON();
    return this.data;
  }
  private get __frame(): FrameType<typeof this> | undefined {
    return undefined;
  }
}
