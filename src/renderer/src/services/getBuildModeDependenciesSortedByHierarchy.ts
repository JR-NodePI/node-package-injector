import { DependencyMode } from '@renderer/models/DependencyConstants';
import DependencyPackage from '@renderer/models/DependencyPackage';

import NodeService from './NodeService';
import type { DependencyRelationProjection } from './NodeServiceTypes';

const getDependencyPosition = (
  dependencies: DependencyRelationProjection[],
  { dependencyName }: DependencyRelationProjection,
  currentIndex: number
): number =>
  dependencies.reduce<number>(
    (position, { subDependenciesNames }, index) =>
      subDependenciesNames.includes(dependencyName) ? index : position,
    currentIndex
  );

const sortDependencies = (
  deps: DependencyRelationProjection[]
): DependencyRelationProjection[] =>
  deps.reduce<DependencyRelationProjection[]>((sorted, dep, index) => {
    const position = getDependencyPosition(sorted, dep, index);
    return sorted.toSpliced(position, 0, dep);
  }, []);

const sortAsManyTimesAsNumberOfDependencies = (
  deps: DependencyRelationProjection[]
): DependencyRelationProjection[] => {
  return Array(deps.length)
    .fill(null)
    .reduce(sortedDeps => sortDependencies(sortedDeps), deps);
};

export default async function getBuildModeDependenciesSortedByHierarchy(
  dependencies: DependencyPackage[]
): Promise<Array<DependencyRelationProjection>> {
  // filter dependencies by build mode
  const buildModeDeps = dependencies.filter(
    ({ mode }) => mode === DependencyMode.BUILD
  );

  // get all dependencies names
  const allDepNames = await Promise.all(
    buildModeDeps.map(async ({ cwd }) => await NodeService.getPackageName(cwd))
  );

  // get the list of dependencies with their related dependencies
  const depsWithSubDeps = await Promise.all(
    buildModeDeps.map(
      async (dependency): Promise<DependencyRelationProjection> => {
        const dependencyName =
          (await NodeService.getPackageName(dependency.cwd)) ?? '';
        const allNpmDepNames =
          (await NodeService.getDependenciesNames(dependency.cwd)) ?? [];
        const subDependenciesNames = allNpmDepNames.filter(packageName =>
          allDepNames.includes(packageName)
        );
        return {
          dependencyName,
          subDependenciesNames,
          dependency,
        };
      }
    )
  );

  // sort dependencies by hierarchy
  const sortedDependencies =
    sortAsManyTimesAsNumberOfDependencies(depsWithSubDeps);

  return sortedDependencies;
}
