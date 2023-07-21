import { useEffect, useState } from 'react';

import PersistService from '@renderer/services/PersistService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Newable<T = any> = new (...args: any) => T;

export default function usePersistedState<T>(
  key: string,
  defaultValue: T,
  Model?: Newable
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

      if (Model != null && Array.isArray(persistedData)) {
        const newData = persistedData.map(item =>
          Object.assign(new Model(), item)
        ) as T;
        setData(newData);
        return;
      }

      if (Model != null && persistedData != null) {
        const newData = Object.assign(new Model(), persistedData) as T;
        setData(newData);
        return;
      }

      if (persistedData != null) {
        setData(persistedData);
      }
    })();
  }, [key]);

  return [data, setData];
}
