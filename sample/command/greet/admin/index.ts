import { ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { AbortError, SubCommandGroup } from '../../../../src';
import En from './en';
import Ja from './ja';

export default class Admin extends SubCommandGroup {
  constructor() {
    super({
      name: 'admin',
      description: 'Greetings for admins',
      options: [new En(), new Ja()],
    });
  }
  async handle(interaction: ChatInputCommandInteraction<'cached'>) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      await interaction.reply(
        'You are not admin, so you cannot use this command.'
      );
      throw new AbortError();
    }
  }
}
