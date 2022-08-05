import { Collection } from 'discord.js';

export interface Database {
  findUnique(options: { where: { id: string } }): Promise<DatabaseType | null>;
  upsert(options: {
    where: { id: string };
    update: DatabaseType;
    create: DatabaseType;
  }): Promise<void>;
}

type JsonObject = { [key in string]: JsonValue };
type JsonValue = string | number | boolean | JsonObject | JsonArray | null;
type JsonArray = JsonValue[];

export interface DatabaseType {
  id: string; // depends on what kind of idgen you use.
  classKey: string; // the key set in class or the name of the class
  classVersion: string | null; // version set in class or null
  data: JsonObject;
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
    if (!found) return undefined;

    const classFound = this.classes.get(found.classKey);
    if (
      !classFound ||
      (classFound.version && classFound.version !== found.classVersion)
    )
      return undefined;

    const deserializer =
      classFound.deserialize ??
      ((serlialized: JsonObject) => {
        const obj = Object.create(classFound.prototype);
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

    const classFound = this.classes.find((c) => value instanceof c);
    if (!classFound)
      throw new Error(
        'Unknown instance of class supplied. Maybe forgot to register?'
      );

    const serliazer =
      classFound.serialize ??
      ((instance: T) => {
        return JSON.parse(JSON.stringify(instance)) as JsonObject;
      });
    const data: DatabaseType = {
      id,
      classKey: classFound.key ?? classFound.name,
      classVersion: classFound.version ?? null,
      data: serliazer(value),
    };

    await this.store.upsert({
      where: { id },
      update: data,
      create: data,
    });
  }
}
