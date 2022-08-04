import {
  ApplicationCommandData,
  Client,
  ComponentBuilder,
  GuildResolvable,
  Interaction,
} from 'discord.js';
import {
  ApplicationCommandBases,
  CallIfMatches,
  DataTypes,
  CommandTypes,
  isT,
  Button,
  SelectMenu,
  Modal,
} from './bases';
import { DataStore, DefaultDataStore } from './store';

export default class InteractionFrame<
  T extends DataStore<string, DataTypes[CommandTypes]> = DefaultDataStore<
    DataTypes[CommandTypes]
  >
> {
  store: T;
  constructor(options: { store: T }) {
    this.store = options?.store;
  }
  async interactionCreate(interaction: Interaction) {
    if (!interaction.inCachedGuild()) return;

    const i = interaction as Interaction & {
      commandName?: string;
      customId?: string;
    };
    const key = i.commandName || i.customId;
    if (!key) return;
    const value = await this.store.get(key);
    if (!value) return;
    await CallIfMatches(value, interaction);
  }

  async registerCommand(options: {
    client: Client<true>;
    commands:
      | ApplicationCommandBases[]
      | Record<string, ApplicationCommandBases>;
    guilds?: boolean | GuildResolvable[];
    subscribeToEvent?: boolean;
  }) {
    const { client } = options;
    if (options.subscribeToEvent) {
      client.on('interactionCreate', this.interactionCreate.bind(this));
    }

    const commands = (
      Array.isArray(options.commands)
        ? options.commands
        : Object.values(options.commands)
    ).map((command) =>
      typeof command === 'function' ? new command() : command
    );

    const guilds =
      options.guilds === true
        ? (await client.guilds.fetch()).map((v) => v.id)
        : options.guilds;

    await Promise.all(
      commands.map((command) => {
        return this.store.set(command.definition.name, command);
      })
    );

    const defs: ApplicationCommandData[] = (await this.store.values())
      .map((v) => {
        if (isT('CHAT_INPUT', v) || isT('MESSAGE', v) || isT('USER', v)) {
          return v.definition;
        }
      })
      .filter(
        (v): v is Exclude<typeof v, undefined> => typeof v !== 'undefined'
      );

    if (guilds) {
      for (const guild of guilds) {
        const guildId = client.guilds.resolveId(guild);
        if (!guildId) continue;
        await client.application?.commands.set(defs, guildId);
      }
    } else {
      await client.application?.commands.set(defs);
    }
  }

  ComponentBase<T extends 'BUTTON' | 'SELECT_MENU' | 'MODAL'>(base: T) {
    const Bases = {
      BUTTON: Button,
      SELECT_MENU: SelectMenu,
      MODAL: Modal,
    };
    const BaseClass = Bases[base];

    // we cannot modify BaseClass.prototype directory,
    // so copy the function first.
    const Base = BaseClass.bind(null) as typeof BaseClass;

    // this is necessary for discord.js to treat WithHandler as ComponentBuilder,
    // urging it to call toJSON().
    Base.prototype = Object.create(ComponentBuilder.prototype);

    // prepare Base.prototype, because it is empty now.
    // and also, setting the store.
    Object.defineProperties(Base.prototype, {
      ...Object.getOwnPropertyDescriptors(BaseClass.prototype),
      store: {
        get: () => this.store,
      },
    });

    return Base;
  }
}
