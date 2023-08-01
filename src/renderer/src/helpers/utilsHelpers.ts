import { TAB_TITLE_TEMPLATE } from '../constants';

export const replaceValues = (
  text: string,
  values: Record<string, string>
): string => {
  return text.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
    return values[key] || match;
  });
};

export const getTabTitle = (tabNumber: number): string => {
  return replaceValues(TAB_TITLE_TEMPLATE, {
    number: `${tabNumber}`,
  });
};
