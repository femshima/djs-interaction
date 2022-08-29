import { ButtonInteraction, ButtonStyle } from 'discord.js';
import { Button } from '../../src';

export default class MoreFixed extends Button {
  constructor() {
    super({
      label: 'More!',
      fixed_custom_id: true,
      style: ButtonStyle.Primary,
    });
  }
  async handle(interaction: ButtonInteraction<'cached'>) {
    interaction.reply(`More(fixed)\n${interaction.message.content}`);
  }
}
