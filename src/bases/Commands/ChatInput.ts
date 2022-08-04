import {
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';
import {
  ChatInputApplicationCommandDataWithSubCommand,
  SubCommand,
  SubCommandGroup,
} from '../SubCommand';

export default abstract class ChatInputApplicationCommandBase {
  readonly type = 'CHAT_INPUT';
  constructor(private data: ChatInputApplicationCommandDataWithSubCommand) {}
  handle?(interaction: ChatInputCommandInteraction<'cached'>): Promise<void>;

  get definition(): ChatInputApplicationCommandData {
    return {
      ...this.data,
      options: this.data.options?.map((d2) => {
        if (d2 instanceof SubCommand) {
          return d2.definition;
        } else if (d2 instanceof SubCommandGroup) {
          return {
            ...d2.definition,
            options: d2.definition.options?.map((d3) => {
              if (d3 instanceof SubCommand) {
                return d3.definition;
              } else {
                return d3;
              }
            }),
          };
        } else {
          return d2;
        }
      }),
    };
  }
  subCommands(
    groupName: string | null,
    commandName: string | null
  ): (SubCommand | SubCommandGroup)[] {
    return (this.data.options ?? [])
      .map((option1) => {
        if (
          option1 instanceof SubCommand &&
          groupName === null &&
          option1.definition.name === commandName
        ) {
          return option1;
        } else if (
          option1 instanceof SubCommandGroup &&
          option1.definition.name === groupName
        ) {
          const subcommands = option1.definition.options?.filter(
            (option2): option2 is SubCommand => {
              return (
                option2 instanceof SubCommand &&
                option2.definition.name === commandName
              );
            }
          );
          return [option1, ...(subcommands ?? [])];
        }
      })
      .flat()
      .filter(
        (v): v is Exclude<typeof v, undefined> => typeof v !== 'undefined'
      );
  }
}
