import path from 'node:path';
export const isDevMode = process.env.NODE_ENV === 'development';
export const extraResourcesPath = isDevMode
  ? path.join(__dirname, '../../', 'extraResources')
  : path.join(process.resourcesPath ?? '', 'extraResources');
