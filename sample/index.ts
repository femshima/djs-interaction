import { Client, GatewayIntentBits } from 'discord.js';
import env from './env';
import * as Command from './command';
import * as ContextMenu from './contextmenu';
import * as Component from './component';
import { frame } from '../src';

const { BOT_TOKEN } = env;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.login(BOT_TOKEN).then(async () => {
  await frame.setup({
    client,
    commands: {
      ...Command,
      ...ContextMenu,
    },
    components: Component,
    guilds: !env.production,
    subscribeToEvent: true,
    async fallback(interaction) {
      if ('replied' in interaction && !interaction.replied) {
        await interaction.reply('Unknown interaction.');
      }
    },
  });
  console.log('Command initialized!');
});
