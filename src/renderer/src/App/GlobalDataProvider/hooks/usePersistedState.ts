import { useEffect, useState } from 'react';

import PersistService from '@renderer/services/PersistService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Newable<T = any> = new (...args: any) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getParsedModel = <T>(templateValue: any, value: any): T => {
  const Model =
    templateValue != null && typeof templateValue === 'object'
      ? templateValue?.constructor
      : undefined;

  if (Model != null) {
    return parseModel<typeof Model>(value, templateValue);
  }

  return value;
};

const parseModel = <T>(data: T, templateValue?: T): T => {
  if (Array.isArray(data) && Array.isArray(templateValue)) {
    return data.map(dataItem => parseModel(dataItem, templateValue[0])) as T;
  }

  if (
    data != null &&
    templateValue != null &&
    templateValue.constructor != null
  ) {
    const Model = templateValue.constructor as Newable;
    const parsedData = Object.entries(data).reduce(
      (newInstance, [key, value]) => {
        if (Object.hasOwn(templateValue, key)) {
          const templateValueItem = templateValue[key];

          newInstance[key] = getParsedModel<typeof templateValueItem>(
            templateValueItem,
            value
          );
        }
        return newInstance;
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
  templateValue?: T
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
      const parsedData = parseModel<T>(persistedData, templateValue);
      setData(parsedData);
    })();
  }, [key]);

  return [data, setData];
}
