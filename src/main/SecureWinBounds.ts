import { screen } from 'electron';
import Config from 'electron-config';

const config = new Config();

export default class SecureWinBounds {
  private static _defaultWidth = 800;
  private static _defaultHeight = 600;

  static get(): Electron.Rectangle {
    const { workArea } = screen.getPrimaryDisplay();
    const winBounds: Electron.Rectangle = config.has('winBounds')
      ? config.get('winBounds')
      : {
          ...workArea,
          width: SecureWinBounds._defaultWidth,
          height: SecureWinBounds._defaultHeight,
        };

    const secureX = (winBounds?.x ?? 0) < workArea.x ? workArea.x : winBounds.x;

    let secureWidth =
      (winBounds?.width ?? 0) < SecureWinBounds._defaultWidth
        ? SecureWinBounds._defaultWidth
        : winBounds.width;

    const secureY = (winBounds?.y ?? 0) < workArea.y ? workArea.y : winBounds.y;

    let secureHeight =
      (winBounds?.height ?? 0) < SecureWinBounds._defaultHeight
        ? SecureWinBounds._defaultHeight
        : winBounds.height;

    if (secureX + secureWidth > workArea.width) {
      secureWidth = workArea.width - secureX;
    }

    if (secureWidth < SecureWinBounds._defaultWidth) {
      secureWidth = SecureWinBounds._defaultWidth;
    }

    if (secureY + secureHeight > workArea.height) {
      secureHeight = workArea.height - secureY;
    }

    if (secureHeight < SecureWinBounds._defaultHeight) {
      secureHeight = SecureWinBounds._defaultHeight;
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
