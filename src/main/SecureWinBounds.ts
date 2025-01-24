import { screen } from 'electron';
import Config from 'electron-config';

const config = new Config();

export default class SecureWinBounds {
  private static _defaultWinWidth = 800;
  private static _defaultWinHeight = 600;

  static get(): Electron.Rectangle {
    const { workArea } = screen.getPrimaryDisplay();
    const winBounds: Electron.Rectangle = config.has('winBounds')
      ? config.get('winBounds')
      : {
          ...workArea,
          width: SecureWinBounds._defaultWinWidth,
          height: SecureWinBounds._defaultWinHeight,
        };

    const secureX = (winBounds?.x ?? 0) < workArea.x ? workArea.x : winBounds.x;

    let secureWidth =
      (winBounds?.width ?? 0) < SecureWinBounds._defaultWinWidth
        ? SecureWinBounds._defaultWinWidth
        : winBounds.width;

    const secureY = (winBounds?.y ?? 0) < workArea.y ? workArea.y : winBounds.y;

    let secureHeight =
      (winBounds?.height ?? 0) < SecureWinBounds._defaultWinHeight
        ? SecureWinBounds._defaultWinHeight
        : winBounds.height;

    if (secureX + secureWidth > workArea.width) {
      secureWidth = workArea.width - secureX;
    }

    if (secureWidth < SecureWinBounds._defaultWinWidth) {
      secureWidth = SecureWinBounds._defaultWinWidth;
    }

    if (secureY + secureHeight > workArea.height) {
      secureHeight = workArea.height - secureY;
    }

    if (secureHeight < SecureWinBounds._defaultWinHeight) {
      secureHeight = SecureWinBounds._defaultWinHeight;
    }

    return {
      x: secureX,
      y: secureY,
      width: secureWidth,
      height: secureHeight,
    };
  }

  static set(winBounds: Electron.Rectangle): void {
    config.set('winBounds', winBounds);
  }
}
