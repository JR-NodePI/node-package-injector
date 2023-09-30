import { useEffect, useRef, useState } from 'react';

import { parseModel } from '@renderer/helpers/parseHelpers';
import PersistService from '@renderer/services/PersistService';

type SetDataAndPersistFn<T> = (newData: T) => Promise<void>;
type usePersistedStateProps<T> = [T, SetDataAndPersistFn<T>, boolean];

export default function usePersistedState<T>(
  key: string,
  defaultValue: T,
  templateValue?: T
): usePersistedStateProps<T> {
  const [templateValueMemo] = useState<T | undefined>(templateValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T>(defaultValue);

  const refSetDataAndPersist = useRef<SetDataAndPersistFn<T>>(
    async (newData: T): Promise<void> => {
      setData(newData);
      await PersistService.setItem<T>(key, newData);
    }
  );

  useEffect(() => {
    (async (): Promise<void> => {
      const persistedData = await PersistService.getItem<T>(key);
      const parsedData = parseModel<T>(persistedData, templateValueMemo);
      if (parsedData !== undefined) {
        setData(parsedData);
      }
      setLoading(false);
    })();
  }, [key, templateValueMemo]);

  return [data, refSetDataAndPersist.current, loading];
}
