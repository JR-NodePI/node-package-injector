import "./electron";
import * as electronReload from "electron-reloader";

if (process.env?.DEV_PORT != null) {
  (async () => {
    try {
      electronReload(module);
    } catch (error) {
      console.error(error);
    }
  })();
}
