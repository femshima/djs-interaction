import { ChatInputCommandInteraction } from 'discord.js';
import { SubCommand } from '../../../../src';

export default class En extends SubCommand {
  constructor() {
    super({
      name: 'en',
      description: 'Greet in English!',
    });
  }
  async handle(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.reply('Hello!');
  }
}
