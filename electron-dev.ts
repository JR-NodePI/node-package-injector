import './electron';

import * as electronReload from 'electron-reloader';

if (process.env?.DEV_PORT != null) {
  (async (): Promise<void> => {
    try {
      electronReload(module);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  })();
}
