import { Collection } from 'discord.js';

export interface Database {
  findUnique(options: {
    where: { id: string };
  }): Promise<DatabaseType<JsonValue> | null>;
  create(options: { data: DatabaseType<JsonObject> }): Promise<unknown>;
}

type JsonObject = { [key in string]?: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = string | number | boolean | JsonObject | JsonArray | null;

interface DatabaseType<T extends JsonValue> {
  id: string; // depends on what kind of idgen you use.
  classKey: string; // the key set in class or the name of the class
  classVersion: string | null; // version set in class or null
  data: T;
}

export interface ClassType<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
  key?: string;
  version?: string;
  serialize?(instance: T): JsonObject;
  deserialize?(serialized: JsonObject): T;
}

export default class StoreAdapter<T> {
  cache: Collection<string, T> = new Collection();
  classes: Collection<string, ClassType<T>>;
  constructor(classes: ClassType<T>[], public store?: Database) {
    this.classes = new Collection(classes.map((c) => [c.key ?? c.name, c]));
  }
  async fetch(id: string) {
    const fromCache = this.cache.get(id);
    if (fromCache) return fromCache;

    const found = await this.store?.findUnique({ where: { id } });
    if (
      !found ||
      !found.data ||
      Array.isArray(found.data) ||
      typeof found.data !== 'object'
    )
      return undefined;

    const ClassFound = this.classes.get(found.classKey);
    if (
      !ClassFound ||
      (ClassFound.version && ClassFound.version !== found.classVersion)
    )
      return undefined;

    const deserializer =
      ClassFound.deserialize ??
      ((serlialized: JsonObject) => {
        const obj = Object.create(ClassFound.prototype);
        Object.entries(serlialized).forEach(([k, v]) => {
          obj[k] = v;
        });
        return obj as T;
      });
    return deserializer(found.data);
  }
  async set(id: string, value: T) {
    this.cache.set(id, value);

    if (!this.store) return;

    const ClassFound = this.classes.find((c) => value instanceof c);
    if (!ClassFound)
      throw new Error(
        'Unknown instance of class supplied. Maybe forgot to register?'
      );

    const serlializer =
      ClassFound.serialize ??
      ((instance: T): JsonObject => {
        return Object.fromEntries(
          Object.entries(instance).map(([key, value]) => [
            key,
            JSON.parse(JSON.stringify(value)),
          ])
        );
      });
    const data: DatabaseType<JsonObject> = {
      id,
      classKey: ClassFound.key ?? ClassFound.name,
      classVersion: ClassFound.version ?? null,
      data: serlializer(value),
    };

    await this.store.create({ data });
  }
}
