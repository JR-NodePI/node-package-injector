import { TAB_TITLE_TEMPLATE } from './constants';

export const getTextReplaced = (
  text: string,
  replacements: Record<string, string>
): string => {
  return text.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
    return replacements[key] || match;
  });
};

export const getTabTitle = (tabNumber: number): string => {
  return getTextReplaced(TAB_TITLE_TEMPLATE, { number: `${tabNumber}` });
};
