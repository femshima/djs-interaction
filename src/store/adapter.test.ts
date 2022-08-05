import StoreAdapter from './adapter';

interface Data {
  d: 'X';
}

class Store {}
class IDGen {}

abstract class TargetBase {
  readonly type = 'MODAL';
  constructor(public data: Data) {}
  abstract handle(fn: () => void): Promise<void>;
  toJSON() {
    return this.data;
  }
  get store() {
    return new Store();
  }
  get idGen() {
    return new IDGen();
  }
}

class Target extends TargetBase {
  constructor(public message: string) {
    super({ d: 'X' });
  }
  async handle(fn: () => void): Promise<void> {
    fn();
  }
}

describe('StoreAdapter', () => {
  it('set and fetch using cache', async () => {
    const adapter = new StoreAdapter<TargetBase>([Target]);
    await adapter.set('id-1', new Target('msg'));
    const fetched = await adapter.fetch('id-1');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fetched as any)['message']).toBe('msg');
  });

  it('serialize', async () => {
    const upsert = jest.fn();
    const adapter = new StoreAdapter<TargetBase>([Target], {
      findUnique: jest.fn(),
      create: upsert,
    });
    await adapter.set('id-1', new Target('msg'));
    expect(upsert).toBeCalledWith(
      expect.objectContaining({
        data: {
          id: 'id-1',
          classKey: 'Target',
          classVersion: null,
          data: {
            type: 'MODAL',
            message: 'msg',
            data: { d: 'X' },
          },
        },
      })
    );
  });

  it('deserialize', async () => {
    const adapter = new StoreAdapter<TargetBase>([Target], {
      findUnique: async () => ({
        id: 'id-1',
        classKey: 'Target',
        classVersion: null,
        data: {
          type: 'MODAL',
          message: 'msg',
          data: { d: 'X' },
        },
      }),
      create: jest.fn(),
    });
    const fetched = await adapter.fetch('id-1');
    expect(fetched).toBeInstanceOf(Target);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((fetched as any)['message']).toBe('msg');
    const fn = jest.fn();
    await fetched?.handle(fn);
    expect(fn).toBeCalled();
  });
});
