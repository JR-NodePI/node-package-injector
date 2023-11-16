import { NODE_PI_FILE_PREFIX } from './constants';
import PackageBunch from './models/PackageBunch';
import PathService from './services/PathService';
import PersistService from './services/PersistService';
import WSLService from './services/WSLService';

window.addEventListener('contextmenu', e => {
  e.preventDefault();
  window.electron.ipcRenderer.send('show-context-menu');
});

window.electron.ipcRenderer.on('reset', () => {
  PersistService.clear();
  window.electron.ipcRenderer.send('reload');
});

window.electron.ipcRenderer.on('before-close', async (): Promise<void> => {
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

  const allScriptValues = [
    ...(packageBunch.targetPackage.scripts ?? []).map(({ scriptValue }) =>
      scriptValue ? `"${scriptValue}"` : ``
    ),
    ...(packageBunch.targetPackage.afterBuildScripts ?? []).map(
      ({ scriptValue }) => (scriptValue ? `"${scriptValue}"` : ``)
    ),
    ...packageBunch.dependencies
      .map(({ scripts }) =>
        (scripts ?? []).map(({ scriptValue }) =>
          scriptValue ? `"${scriptValue}"` : ``
        )
      )
      .flat(),
  ].filter(Boolean);

  window.electron.ipcRenderer.send('reset-all-before-close', {
    resetAllCommand: PathService.getExtraResourcesScriptPath(
      'node_pi_reset_all.sh'
    ),
    killAllCommand: PathService.getExtraResourcesScriptPath(
      'node_pi_kill_all.sh'
    ),
    NODE_PI_FILE_PREFIX,
    cwd,
    targetPackageCwd,
    dependenciesCWDs,
    allScriptValues,
  });
});
