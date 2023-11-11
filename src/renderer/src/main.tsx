import ReactDOM from 'react-dom/client';

import App from './App';
import PersistService from './services/PersistService';

import './main.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);

window.addEventListener('contextmenu', e => {
  e.preventDefault();
  window.electron.ipcRenderer.send('show-context-menu');
});

window.electron.ipcRenderer.on('reset', () => {
  PersistService.clear();
  window.electron.ipcRenderer.send('reload');
});

window.electron.ipcRenderer.on('before-quit', async () => {
  const data = await PersistService.getItem('packageBunches');
  window.electron.ipcRenderer.send('before-quit-data', data);
});
