import {
  ButtonInteraction,
  SelectMenuInteraction,
  ModalSubmitInteraction,
  CommandInteraction,
  Interaction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from 'discord.js';
import AbortError from '../error/AbortError';
import ChatInputApplicationCommandBase from './Comamnds/ChatInput';
import MessageApplicationCommandBase from './Comamnds/MessageContextMenu';
import UserApplicationCommandBase from './Comamnds/UserContextMenu';
import Button from './Components/Button';
import Modal from './Components/Modal';
import SelectMenu from './Components/SelectMenu';

export {
  ChatInputApplicationCommandBase,
  MessageApplicationCommandBase,
  UserApplicationCommandBase,
};
export * from './SubCommand';

export interface InteractionTypes {
  CHAT_INPUT: CommandInteraction<'cached'>;
  MESSAGE: MessageContextMenuCommandInteraction<'cached'>;
  USER: UserContextMenuCommandInteraction<'cached'>;
  BUTTON: ButtonInteraction<'cached'>;
  SELECT_MENU: SelectMenuInteraction<'cached'>;
  MODAL: ModalSubmitInteraction<'cached'>;
}

export interface DataTypes {
  CHAT_INPUT: ChatInputApplicationCommandBase;
  MESSAGE: MessageApplicationCommandBase;
  USER: UserApplicationCommandBase;
  BUTTON: Button;
  SELECT_MENU: SelectMenu;
  MODAL: Modal;
}

export type ApplicationCommandBases =
  | ChatInputApplicationCommandBase
  | MessageApplicationCommandBase
  | UserApplicationCommandBase;

export function isT<T extends keyof InteractionTypes>(
  type: T,
  target: unknown
): target is DataTypes[T] {
  const arg = target as { type?: string };
  return type === (arg.type ?? 'CHAT_INPUT');
}

export async function CallIfMatches(
  target: DataTypes[keyof InteractionTypes],
  interaction: Interaction<'cached'>
) {
  if (interaction.isChatInputCommand() && isT('CHAT_INPUT', target)) {
    try {
      await target.handle?.(interaction);
      for (const subcommand of target.subCommands) {
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
