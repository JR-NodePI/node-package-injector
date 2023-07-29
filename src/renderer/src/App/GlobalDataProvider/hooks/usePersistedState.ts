import { useEffect, useState } from 'react';

import PersistService from '@renderer/services/PersistService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Newable<T = any> = new (...args: any) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getParsedModel = <T>(instanceValue: any, value: any): T => {
  const Model =
    instanceValue != null && typeof instanceValue === 'object'
      ? instanceValue?.constructor
      : Array.isArray(instanceValue) && instanceValue.length > 0
      ? instanceValue[0]?.constructor
      : undefined;

  if (Model != null) {
    return parseModel<typeof Model>(Model, value);
  }

  return value;
};

const parseModel = <T>(Model: Newable, data: T): T => {
  if (Model != null && Array.isArray(data)) {
    return data.map(item => parseModel<typeof Model>(Model, item)) as T;
  }

  if (Model != null && data != null) {
    const parsedData = Object.entries(data).reduce(
      (instance: typeof Model, [key, value]) => {
        if (Object.hasOwn(instance, key)) {
          const instanceValue = instance[key];
          instance[key] = getParsedModel<typeof instanceValue>(
            instanceValue,
            value
          );
        }
        return instance;
      },
      new Model()
    ) as T;

    return parsedData;
  }

  return data;
};

export default function usePersistedState<T>(
  key: string,
  defaultValue: T,
  Model: Newable
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [data, setData] = useState<T>(defaultValue);

  useEffect(() => {
    (async (): Promise<void> => {
      await PersistService.setItem<T>(key, data);
    })();
  }, [key, data]);

  useEffect(() => {
    (async (): Promise<void> => {
      const persistedData = await PersistService.getItem<T>(key);
      const parsedData = parseModel<T>(Model, persistedData);
      setData(parsedData);
    })();
  }, [key]);

  return [data, setData];
}
