import { CommandInteraction } from 'discord.js';
import { Command } from '../../src';
import { MyModal } from '../component';

export default class ShowModal extends Command {
  constructor() {
    super({
      name: 'showmodal',
      description: 'Shows Modal',
    });
  }

  async handle(interaction: CommandInteraction<'cached'>) {
    await interaction.showModal(new MyModal());
  }
}
