import { useCallback, useMemo } from 'react';

import type DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageBunch from '@renderer/models/PackageBunch';
import debounce from 'lodash/debounce';

import { packageBunchesTemplate } from '../../models/GlobalDataConstants';
import { GlobalDataProps } from './GlobalDataContext';
import usePersistedState from './usePersistedState';

type PersistedPackageBunchesProps = Pick<
  GlobalDataProps,
  | 'activeDependencies'
  | 'activePackageBunch'
  | 'activeTargetPackage'
  | 'packageBunches'
  | 'setActiveDependencies'
  | 'setActiveTargetPackage'
  | 'setPackageBunches'
> & {
  packageBunchesLoading: boolean;
};

export default function usePersistedPackageBunches(): PersistedPackageBunchesProps {
  const [packageBunches, setPackageBunches, packageBunchesLoading] =
    usePersistedState<PackageBunch[]>(
      'packageBunches',
      [],
      packageBunchesTemplate
    );

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

  return useMemo<PersistedPackageBunchesProps>(() => {
    const activePackageBunch =
      packageBunches?.find(bunch => bunch.active) ?? new PackageBunch();

    const activeDependencies = activePackageBunch?.dependencies ?? [];

    const activeTargetPackage =
      activePackageBunch?.targetPackage ?? new NodePackage();

    return {
      activeDependencies,
      activePackageBunch,
      activeTargetPackage,
      packageBunches,
      setActiveDependencies,
      setActiveTargetPackage,
      setPackageBunches,
      packageBunchesLoading,
    };
  }, [
    packageBunches,
    packageBunchesLoading,
    setActiveDependencies,
    setActiveTargetPackage,
    setPackageBunches,
  ]);
}
