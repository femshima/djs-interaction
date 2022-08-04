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
  get subCommands(): (SubCommand | SubCommandGroup)[] {
    return (this.data.options ?? [])
      .map((o) => {
        if (o instanceof SubCommand) {
          return o;
        } else if (o instanceof SubCommandGroup) {
          const subcommands = o.definition.options?.filter(
            (o): o is SubCommand => {
              return o instanceof SubCommand;
            }
          );
          return [o, ...(subcommands ?? [])];
        }
      })
      .flat()
      .filter(
        (v): v is Exclude<typeof v, undefined> => typeof v !== 'undefined'
      );
  }
}
