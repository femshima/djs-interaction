import { CommandInteraction, ComponentType } from 'discord.js';
import { Command } from '../../src';
import { More } from '../component';
import Link from '../component/link';
import MoreFixed from '../component/more-fixed';

export default class Ping extends Command {
  constructor() {
    super({
      name: 'ping',
      description: 'Ping!',
    });
  }

  async handle(interaction: CommandInteraction<'cached'>) {
    await interaction.reply({
      content: 'Pong!',
      components: [
        {
          type: ComponentType.ActionRow,
          components: [new More('Hello!'), new MoreFixed(), new Link()],
        },
      ],
    });
  }
}
