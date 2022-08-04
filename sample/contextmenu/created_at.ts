import { UserContextMenuCommandInteraction } from 'discord.js';
import { UserContextMenu } from '../../src';

export default class UserCreatedAt extends UserContextMenu {
  constructor() {
    super({
      name: 'created_at',
    });
  }

  async handle(interaction: UserContextMenuCommandInteraction<'cached'>) {
    await interaction.reply(interaction.targetUser.createdAt.toISOString());
  }
}
