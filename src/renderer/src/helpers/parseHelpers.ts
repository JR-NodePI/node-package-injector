type Newable<T> = new (...args) => T;

const getParsedModel = <T>(templateValue: T, value: T): T => {
  const Model =
    templateValue != null && typeof templateValue === 'object'
      ? templateValue?.constructor
      : undefined;

  if (Model != null) {
    return parseModel<T>(value, templateValue);
  }

  return value;
};

export const parseModel = <T>(data: T, templateValue?: T): T => {
  if (Array.isArray(data) && Array.isArray(templateValue)) {
    return data.map(dataItem => parseModel(dataItem, templateValue[0])) as T;
  }

  if (data != null && templateValue?.constructor != null) {
    const Model = templateValue.constructor as Newable<T>;

    const parsedModelData = new Model();

    Object.entries<T[keyof T]>(data).forEach(([key, value]) => {
      if (Object.hasOwn(templateValue, key)) {
        const templateValueItem = templateValue[key] as T[keyof T];
        parsedModelData[key] = getParsedModel<T[keyof T]>(
          templateValueItem,
          value
        );
      }
    });

    return parsedModelData;
  }

  return data;
};
