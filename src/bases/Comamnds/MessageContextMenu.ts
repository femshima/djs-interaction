import {
  MessageContextMenuCommandInteraction,
  MessageApplicationCommandData,
  ApplicationCommandType,
} from 'discord.js';

export default abstract class MessageApplicationCommandBase {
  readonly type = 'MESSAGE';
  definition: MessageApplicationCommandData;
  constructor(definition: Omit<MessageApplicationCommandData, 'type'>) {
    this.definition = {
      type: ApplicationCommandType.Message,
      ...definition,
    };
  }
  abstract handle(
    interaction: MessageContextMenuCommandInteraction<'cached'>
  ): Promise<void>;
}
