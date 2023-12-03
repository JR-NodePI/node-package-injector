import PersistService from './services/PersistService';
import RunService from './services/RunService/RunService';

window.addEventListener('contextmenu', e => {
  e.preventDefault();
  window.electron.ipcRenderer.send('show-context-menu');
});

window.electron.ipcRenderer.on('reset', () => {
  PersistService.clear();
  window.electron.ipcRenderer.send('reload');
});

window.electron.ipcRenderer.on('before-close', (): void => {
  RunService.resetKillAll(true);
});
