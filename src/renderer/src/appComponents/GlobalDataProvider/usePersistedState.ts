import { useEffect, useState } from 'react';

import { parseModel } from '@renderer/models/ModelHelpers';
import PersistService from '@renderer/services/PersistService';

type usePersistedStateProps<T> = [T, (newData: T) => Promise<void>, boolean];

export default function usePersistedState<T>(
  key: string,
  defaultValue: T,
  templateValue?: T
): usePersistedStateProps<T> {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T>(defaultValue);

  const setDataAndPersist = (newData: T): Promise<void> => {
    setData(newData);
    return PersistService.setItem<T>(key, newData);
  };

  useEffect(() => {
    (async (): Promise<void> => {
      const persistedData = await PersistService.getItem<T>(key);
      const parsedData = parseModel<T>(persistedData, templateValue);
      if (parsedData !== undefined) {
        setData(parsedData);
      }
      setLoading(false);
    })();
  }, [key, templateValue]);

  return [data, setDataAndPersist, loading];
}
