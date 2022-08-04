import {
  UserContextMenuCommandInteraction,
  UserApplicationCommandData,
  ApplicationCommandType,
} from 'discord.js';

export default abstract class UserApplicationCommandBase {
  readonly type = 'USER';
  definition: UserApplicationCommandData;
  constructor(definition: Omit<UserApplicationCommandData, 'type'>) {
    this.definition = {
      type: ApplicationCommandType.User,
      ...definition,
    };
  }
  abstract handle(
    interaction: UserContextMenuCommandInteraction<'cached'>
  ): Promise<void>;
}
