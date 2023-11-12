import ReactDOM from 'react-dom/client';

import App from './App';
import { NODE_PI_FILE_PREFIX } from './constants';
import PackageBunch from './models/PackageBunch';
import PathService from './services/PathService';
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

const killAllOnClose = async (): Promise<void> => {
  const packageBunches = await PersistService.getItem<PackageBunch[]>(
    'packageBunches'
  );
  const packageBunch = packageBunches.find(bunch => bunch.active);

  if (!packageBunch) {
    return;
  }

  window.electron.ipcRenderer.send('kill-all-before-quit', {
    kill_all_command: PathService.getExtraResourcesScriptPath(
      'node_pi_kill_all.sh'
    ),
    NODE_PI_FILE_PREFIX,
    targetPackageCwd: packageBunch.targetPackage.cwd,
    dependenciesCWDs: packageBunch.dependencies
      .map(({ cwd }) => cwd)
      .filter(Boolean),
  });
};

window.addEventListener('beforeunload', killAllOnClose);
window.electron.ipcRenderer.on('before-quit', killAllOnClose);
