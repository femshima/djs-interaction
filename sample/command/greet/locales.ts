import { ChatInputCommandInteraction } from 'discord.js';
import { SubCommand } from '../../../src';

export default class Locale extends SubCommand {
  constructor() {
    super({
      name: 'locale',
      description: 'shows supported locales',
    });
  }
  async handle(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.reply('en,ja');
  }
}
