import { useCallback, useRef } from 'react';

import LastSelectedScripts from '@renderer/models/LastSelectedScripts';

import { lastSelectedPackagesScriptsTemplate } from '../../models/GlobalDataConstants';
import usePersistedState from './usePersistedState';

export default function useLastSelectedScripts(): {
  getLastSelectedScripts: (
    packageName: string
  ) => LastSelectedScripts | undefined;
  lastSelectedPackagesScriptsLoading: boolean;
  setLastSelectedScripts: (lasSelectedScripts: LastSelectedScripts) => void;
} {
  const [
    lastSelectedPackagesScripts,
    setLastSelectedPackagesScripts,
    isLoading,
  ] = usePersistedState<Array<LastSelectedScripts>>(
    'lastSelectedPackagesScripts',
    [],
    lastSelectedPackagesScriptsTemplate
  );

  const lastSelectedPackagesScriptsRef = useRef(lastSelectedPackagesScripts);

  const getLastSelectedScripts = useCallback((packageName: string) => {
    return lastSelectedPackagesScriptsRef.current.find(
      nodePackage => nodePackage.packageName === packageName
    );
  }, []);

  const setLastSelectedScripts = useCallback(
    (newDataItem: LastSelectedScripts): void => {
      const currentDataItem = lastSelectedPackagesScriptsRef.current.find(
        nodePackage => nodePackage.packageName === newDataItem.packageName
      );

      if (currentDataItem) {
        currentDataItem.dependencyPreBuildScripts =
          newDataItem.dependencyPreBuildScripts ??
          currentDataItem.dependencyPreBuildScripts;

        currentDataItem.dependencyScripts =
          newDataItem.dependencyScripts ?? currentDataItem.dependencyScripts;

        currentDataItem.targetScripts =
          newDataItem.targetScripts ?? currentDataItem.targetScripts;

        currentDataItem.targetPostBuildScripts =
          newDataItem.targetPostBuildScripts ??
          currentDataItem.targetPostBuildScripts;

        lastSelectedPackagesScriptsRef.current =
          lastSelectedPackagesScriptsRef.current.map(item => {
            if (item.packageName === newDataItem.packageName) {
              return newDataItem.clone();
            }
            return item;
          });
      } else {
        lastSelectedPackagesScriptsRef.current = [
          ...lastSelectedPackagesScriptsRef.current,
          newDataItem.clone(),
        ];
      }

      setLastSelectedPackagesScripts(lastSelectedPackagesScriptsRef.current);
    },
    [setLastSelectedPackagesScripts]
  );

  return {
    getLastSelectedScripts,
    lastSelectedPackagesScriptsLoading: isLoading,
    setLastSelectedScripts,
  };
}
