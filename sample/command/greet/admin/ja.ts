import { ChatInputCommandInteraction } from 'discord.js';
import { SubCommand } from '../../../../src';

export default class Ja extends SubCommand {
  constructor() {
    super({
      name: 'ja',
      description: '管理者に日本語で挨拶する',
    });
  }
  async handle(interaction: ChatInputCommandInteraction<'cached'>) {
    await interaction.reply('管理者(のみなさん)、こんにちは');
  }
}
