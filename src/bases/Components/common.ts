import InitializationError from '../../error/InitializationError';
import StoreAdapter from '../../store/adapter';
import { IDGen } from '../../store/idgen';

type DistributiveOmit<T, K extends string | number | symbol> = T extends unknown
  ? Omit<T, K>
  : never;

interface FixedCustomIdOption {
  fixed_custom_id?: boolean;
}

export type ConstructorDataType<T> = DistributiveOmit<T, 'type' | 'custom_id'> &
  (T extends { custom_id?: string } ? FixedCustomIdOption : object);

export interface FrameType<T> {
  idGen: IDGen;
  componentStore: StoreAdapter<T>;
}

interface CreateDataArgs<T, U> {
  self: U;
  data: ConstructorDataType<T>;
  Builder: { new (data: Partial<T>): { toJSON(): T } };
  frame: FrameType<U> | undefined;
  omitCustomId?: boolean;
}

export function createData<T, U>({
  self,
  data,
  Builder,
  frame,
  omitCustomId,
}: CreateDataArgs<T, U>) {
  if (!frame)
    throw new InitializationError('Do not extend Component directly!');

  const copied = { ...data } as Omit<T, 'type'> &
    FixedCustomIdOption & { custom_id?: string };

  if (!omitCustomId) {
    if (copied.fixed_custom_id) {
      const ClassFound = frame.componentStore.resolveConstructor(self);
      copied.custom_id = frame.componentStore.classKey(ClassFound);
    } else {
      copied.custom_id = frame.idGen.generateID();
    }
  }
  delete copied.fixed_custom_id;

  return {
    data: new Builder(copied as Partial<T>).toJSON(),
    onToJSON() {
      if (copied.custom_id && !copied.fixed_custom_id) {
        // Not awaiting because toJSON is called synchronously
        frame.componentStore.set(copied.custom_id, self);
      }
    },
  };
}
