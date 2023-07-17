import ReactDOM from 'react-dom/client';
import PersistService from './services/PersistService';

import './main.css';

import App from './App';

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
