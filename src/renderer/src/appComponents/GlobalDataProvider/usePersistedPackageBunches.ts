import { useCallback, useMemo } from 'react';

import type DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageBunch from '@renderer/models/PackageBunch';
import debounce from 'lodash/debounce';

import { packageBunchesTemplate } from '../../models/GlobalDataConstants';
import { GlobalDataProps } from './GlobalDataContext';
import type { useLastSelectedScriptsReturns } from './useLastSelectedScripts';
import useLastSelectedScripts from './useLastSelectedScripts';
import usePersistedState from './usePersistedState';

type PersistedPackageBunchesReturns = Pick<
  GlobalDataProps,
  | 'activeDependencies'
  | 'activePackageBunch'
  | 'activeTargetPackage'
  | 'packageBunches'
  | 'setActiveDependencies'
  | 'setActiveTargetPackage'
  | 'setPackageBunches'
> & {
  setLastSelectedScripts: useLastSelectedScriptsReturns['setLastSelectedScripts'];
  getLastSelectedScripts: useLastSelectedScriptsReturns['getLastSelectedScripts'];
  packageBunchesLoading: boolean;
};

export default function usePersistedPackageBunches(): PersistedPackageBunchesReturns {
  const [packageBunches, setPackageBunches, isLoading] = usePersistedState<
    PackageBunch[]
  >('packageBunches', [], packageBunchesTemplate);

  const {
    setLastSelectedScripts,
    getLastSelectedScripts,
    lastSelectedScriptsLoading,
  } = useLastSelectedScripts();

  const setPackageBunchActive = useCallback(
    (key: keyof PackageBunch, data: unknown): void => {
      const bunchIndex = packageBunches.findIndex(bunch => bunch.active);
      if (bunchIndex >= 0) {
        const newBunches = packageBunches.map((bunch, index) => {
          if (index === bunchIndex && key in bunch && key !== 'id') {
            (bunch[key] as unknown) = data;
          }
          return bunch;
        });
        setPackageBunches(newBunches);
      }
    },
    [packageBunches, setPackageBunches]
  );

  const _setActiveTargetPackage = useCallback(
    (targetPackage: NodePackage) => {
      setPackageBunchActive('targetPackage', targetPackage);
    },
    [setPackageBunchActive]
  );
  const setActiveTargetPackage = debounce(_setActiveTargetPackage, 10);

  const _setActiveDependencies = useCallback(
    (dependencies: DependencyPackage[]) => {
      setPackageBunchActive('dependencies', dependencies);
    },
    [setPackageBunchActive]
  );
  const setActiveDependencies = debounce(_setActiveDependencies, 10);

  return useMemo<PersistedPackageBunchesReturns>((): PersistedPackageBunchesReturns => {
    const activePackageBunch =
      packageBunches?.find(bunch => bunch.active) ?? new PackageBunch();
    const activeDependencies = activePackageBunch?.dependencies ?? [];
    const activeTargetPackage =
      activePackageBunch?.targetPackage ?? new NodePackage();

    const packageBunchesLoading = isLoading || lastSelectedScriptsLoading;

    return {
      activePackageBunch,
      activeTargetPackage,
      activeDependencies,
      packageBunches,
      setActiveDependencies,
      setActiveTargetPackage,
      setPackageBunches,
      packageBunchesLoading,
      setLastSelectedScripts,
      getLastSelectedScripts,
    };
  }, [
    getLastSelectedScripts,
    isLoading,
    lastSelectedScriptsLoading,
    packageBunches,
    setActiveDependencies,
    setActiveTargetPackage,
    setLastSelectedScripts,
    setPackageBunches,
  ]);
}
