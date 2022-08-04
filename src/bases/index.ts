import { Interaction } from 'discord.js';
import AbortError from '../error/AbortError';
import ChatInputApplicationCommandBase from './Commands/ChatInput';
import MessageApplicationCommandBase from './Commands/MessageContextMenu';
import UserApplicationCommandBase from './Commands/UserContextMenu';
import Button from './Components/Button';
import SelectMenu from './Components/SelectMenu';
import Modal from './Components/Modal';

export {
  ChatInputApplicationCommandBase,
  MessageApplicationCommandBase,
  UserApplicationCommandBase,
  Button,
  SelectMenu,
  Modal,
};
export * from './SubCommand';

export type CommandTypes =
  | 'CHAT_INPUT'
  | 'MESSAGE'
  | 'USER'
  | 'BUTTON'
  | 'SELECT_MENU'
  | 'MODAL';

export interface DataTypes {
  CHAT_INPUT: ChatInputApplicationCommandBase;
  MESSAGE: MessageApplicationCommandBase;
  USER: UserApplicationCommandBase;
  BUTTON: Button;
  SELECT_MENU: SelectMenu;
  MODAL: Modal;
}

type OrConstructable<T> = T | { new (): T };

export type ApplicationCommandBases = OrConstructable<
  | ChatInputApplicationCommandBase
  | MessageApplicationCommandBase
  | UserApplicationCommandBase
>;

export function isT<T extends CommandTypes>(
  type: T,
  target: unknown
): target is DataTypes[T] {
  const arg = target as { type?: string };
  return type === (arg.type ?? 'CHAT_INPUT');
}

export async function CallIfMatches(
  target: DataTypes[CommandTypes],
  interaction: Interaction<'cached'>
) {
  if (interaction.isChatInputCommand() && isT('CHAT_INPUT', target)) {
    try {
      await target.handle?.(interaction);
      for (const subcommand of target.subCommands(
        interaction.options.getSubcommandGroup(),
        interaction.options.getSubcommand(false)
      )) {
        await subcommand?.handle?.(interaction);
      }
    } catch (e) {
      if (e instanceof AbortError) {
        return;
      } else if (e instanceof Error) {
        throw new Error('ChatInput interaction handler throwed an error.', {
          cause: e,
        });
      } else {
        throw e;
      }
    }
  } else if (
    interaction.isMessageContextMenuCommand() &&
    isT('MESSAGE', target)
  ) {
    return target.handle(interaction);
  } else if (interaction.isUserContextMenuCommand() && isT('USER', target)) {
    return target.handle(interaction);
  } else if (interaction.isButton() && isT('BUTTON', target)) {
    return target.handle?.(interaction);
  } else if (interaction.isSelectMenu() && isT('SELECT_MENU', target)) {
    return target.handle(interaction);
  } else if (interaction.isModalSubmit() && isT('MODAL', target)) {
    return target.handle(interaction);
  }
}
