import {
  ApplicationCommandData,
  Client,
  Collection,
  ComponentBuilder,
  GuildResolvable,
  Interaction,
} from 'discord.js';
import {
  ApplicationCommandBases,
  CallIfMatches,
  isT,
  Button,
  SelectMenu,
  Modal,
  ApplicationCommandBaseInstances,
  ComponentClasses,
} from './bases';
import StoreAdapter, { ClassType, Database } from './store/adapter';
import { IDGen, DefaultIDGenerator } from './store/idgen';

type ComponentClassType = ClassType<ComponentClasses>;

export default class InteractionFrame {
  private commandStore: Collection<string, ApplicationCommandBaseInstances> =
    new Collection();
  private componentStore?: StoreAdapter<ComponentClasses>;
  private idGen: IDGen = new DefaultIDGenerator();
  private fallback?: (interaction: Interaction) => Promise<void>;

  async interactionCreate(interaction: Interaction) {
    if (!interaction.inCachedGuild()) return;

    const i = interaction as Interaction & {
      commandName?: string;
      customId?: string;
    };
    const key = i.commandName || i.customId;
    if (!key) return await this.fallback?.(interaction);

    const value =
      this.commandStore.get(key) ?? (await this.componentStore?.fetch(key));
    if (!value) return await this.fallback?.(interaction);

    await CallIfMatches(value, interaction);

    if ('replied' in interaction) {
      if (interaction.replied) await this.fallback?.(interaction);
    } else {
      if (interaction.responded) await this.fallback?.(interaction);
    }
  }

  async setup(options: {
    client: Client<true>;
    commands:
      | ApplicationCommandBases[]
      | Record<string, ApplicationCommandBases>;
    components: ComponentClassType[] | Record<string, ComponentClassType>;
    guilds?: boolean | GuildResolvable[];
    subscribeToEvent?: boolean;
    fallback?: (interaction: Interaction) => Promise<void>;
    database?: Database;
    idGen?: IDGen;
  }) {
    const { client } = options;
    if (options.subscribeToEvent) {
      client.on('interactionCreate', this.interactionCreate.bind(this));
    }

    const components = Array.isArray(options.components)
      ? options.components
      : Object.values(options.components);
    this.componentStore = new StoreAdapter(components, options.database);

    this.fallback = options.fallback;
    this.idGen = options.idGen ?? this.idGen;

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
        return this.commandStore.set(command.definition.name, command);
      })
    );

    const defs: ApplicationCommandData[] = [...this.commandStore.values()]
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
    // and also set the store and the idGen.
    Object.defineProperties(Base.prototype, {
      ...Object.getOwnPropertyDescriptors(BaseClass.prototype),
      __frame: {
        get: () => this,
      },
    });

    return Base;
  }
}
