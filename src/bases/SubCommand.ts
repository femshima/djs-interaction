import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';

export interface ChatInputApplicationCommandDataWithSubCommand
  extends Omit<ChatInputApplicationCommandData, 'options'> {
  options?: (ApplicationCommandOptionData | SubCommand | SubCommandGroup)[];
}
export interface SubCommandGroupDefinition
  extends Omit<ApplicationCommandSubGroupData, 'options'> {
  options?: (ApplicationCommandSubCommandData | SubCommand)[];
}

export abstract class SubCommand {
  public definition: ApplicationCommandSubCommandData;
  constructor(definition: Omit<ApplicationCommandSubCommandData, 'type'>) {
    this.definition = {
      type: ApplicationCommandOptionType.Subcommand,
      ...definition,
    };
  }
  abstract handle(
    interaction: ChatInputCommandInteraction<'cached'>
  ): Promise<void>;
}
export abstract class SubCommandGroup {
  public definition: SubCommandGroupDefinition;
  constructor(definition: Omit<SubCommandGroupDefinition, 'type'>) {
    this.definition = {
      type: ApplicationCommandOptionType.SubcommandGroup,
      ...definition,
    };
  }
  handle?(interaction: ChatInputCommandInteraction<'cached'>): Promise<void>;
}
