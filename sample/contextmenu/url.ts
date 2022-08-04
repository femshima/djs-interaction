import { MessageContextMenuCommandInteraction } from 'discord.js';
import { MessageContextMenu } from '../../src';

export default class SampleUserContext extends MessageContextMenu {
  constructor() {
    super({
      name: 'url',
    });
  }

  async handle(interaction: MessageContextMenuCommandInteraction<'cached'>) {
    await interaction.reply(interaction.targetMessage.url);
  }
}
