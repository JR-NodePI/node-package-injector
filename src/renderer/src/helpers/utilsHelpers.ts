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

const pluralRules = new Intl.PluralRules('en-US', { type: 'ordinal' });
const suffixes = new Map([
  ['one', 'st'],
  ['two', 'nd'],
  ['few', 'rd'],
  ['other', 'th'],
]);
export const formatOrdinals = (number: number): string => {
  const rule = pluralRules.select(number);
  const suffix = suffixes.get(rule);
  return `${number}${suffix}`;
};
