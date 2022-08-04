import { Client, GatewayIntentBits } from 'discord.js';
import env from './env';
import * as Command from './command';
import * as ContextMenu from './contextmenu';
import { frame } from '../src';

const { BOT_TOKEN } = env;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.login(BOT_TOKEN).then(async () => {
  await frame.registerCommand({
    client,
    commands: {
      ...Command,
      ...ContextMenu,
    },
    guilds: !env.production,
    subscribeToEvent: true,
  });
  console.log('Command initialized!');
});
