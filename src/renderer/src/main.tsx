import ReactDOM from 'react-dom/client';

import App from './App';
import { NODE_PI_FILE_PREFIX } from './constants';
import PackageBunch from './models/PackageBunch';
import PathService from './services/PathService';
import PersistService from './services/PersistService';
import WSLService from './services/WSLService';

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

  const cwd = packageBunch.targetPackage.cwd ?? '';
  const targetPackageCwd = await WSLService.cleanSWLRoot(
    packageBunch.targetPackage.cwd ?? '',
    packageBunch.targetPackage.cwd ?? ''
  );
  const dependenciesCWDs = await Promise.all(
    packageBunch.dependencies
      .map(
        async dep => await WSLService.cleanSWLRoot(dep.cwd ?? '', dep.cwd ?? '')
      )
      .filter(Boolean)
  );

  window.electron.ipcRenderer.send('kill-all-before-quit', {
    resetAllCommand: PathService.getExtraResourcesScriptPath(
      'node_pi_reset_all.sh'
    ),
    NODE_PI_FILE_PREFIX,
    cwd,
    targetPackageCwd,
    dependenciesCWDs,
  });
};

window.addEventListener('beforeunload', killAllOnClose);
window.electron.ipcRenderer.on('before-quit', killAllOnClose);
