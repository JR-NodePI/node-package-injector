import Config from 'electron-config';

const config = new Config();

export default class SecureWinBounds {
  private static _defaultWinBounds: Electron.Rectangle = {
    x: 25,
    y: 20,
    width: 800,
    height: 600,
  };

  static get(): Electron.Rectangle {
    const winBounds: Electron.Rectangle = config.has('winBounds')
      ? config.get('winBounds')
      : SecureWinBounds._defaultWinBounds;

    return {
      x:
        winBounds?.x ?? 0 < SecureWinBounds._defaultWinBounds.x
          ? SecureWinBounds._defaultWinBounds.x
          : winBounds.x,
      y:
        winBounds?.y ?? 0 < SecureWinBounds._defaultWinBounds.y
          ? SecureWinBounds._defaultWinBounds.y
          : winBounds.y,
      width:
        winBounds?.width ?? 0 < SecureWinBounds._defaultWinBounds.width
          ? SecureWinBounds._defaultWinBounds.width
          : winBounds.width,
      height:
        winBounds?.height ?? 0 < SecureWinBounds._defaultWinBounds.height
          ? SecureWinBounds._defaultWinBounds.height
          : winBounds.height,
    };
  }

  static set(winBounds: Electron.Rectangle): void {
    config.set('winBounds', winBounds);
  }
}
