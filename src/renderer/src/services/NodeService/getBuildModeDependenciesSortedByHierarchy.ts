import DependencyPackage from '@renderer/models/DependencyPackage';

import NodeService from './NodeService';
import type { RelatedDependencyProjection } from './NodeServiceTypes';

const getDependencyPosition = (
  dependencies: RelatedDependencyProjection[],
  { dependencyName }: RelatedDependencyProjection,
  currentIndex: number
): number =>
  dependencies.reduce<number>(
    (position, { subDependenciesNames }, index) =>
      subDependenciesNames.includes(dependencyName) ? index : position,
    currentIndex
  );

const sortDependencies = (
  deps: RelatedDependencyProjection[]
): RelatedDependencyProjection[] =>
  deps.reduce<RelatedDependencyProjection[]>((sorted, dep, index) => {
    const position = getDependencyPosition(sorted, dep, index);
    return sorted.toSpliced(position, 0, dep);
  }, []);

const sortAsManyTimesAsNumberOfDependencies = (
  deps: RelatedDependencyProjection[]
): RelatedDependencyProjection[] => {
  return Array(deps.length)
    .fill(null)
    .reduce(sortedDeps => sortDependencies(sortedDeps), deps);
};

export default async function getDependenciesSortedByHierarchy(
  dependencies: DependencyPackage[]
): Promise<Array<RelatedDependencyProjection>> {
  // get all dependencies names
  const allDepNamesProjection = await Promise.all(
    dependencies.map(async dependency => ({
      name: await NodeService.getPackageName(dependency.cwd ?? ''),
      dependency,
    }))
  );

  const allDepNames = allDepNamesProjection.map(({ name }) => name);

  // get the list of dependencies with their related dependencies
  const depsWithSubDeps = await Promise.all(
    dependencies.map(
      async (dependency): Promise<RelatedDependencyProjection> => {
        const dependencyName =
          (await NodeService.getPackageName(dependency.cwd ?? '')) ?? '';

        const allNpmDepNames =
          (await NodeService.getDependenciesNames(dependency.cwd ?? '')) ?? [];

        const subDependenciesNames = allNpmDepNames.filter(packageName =>
          allDepNames.includes(packageName)
        );

        const subDependencies = allDepNamesProjection
          .filter(({ name }) => subDependenciesNames.includes(name))
          .map(({ dependency }) => dependency);

        return {
          dependencyName,
          subDependenciesNames,
          dependency,
          subDependencies,
        };
      }
    )
  );

  // sort dependencies by hierarchy
  const sortedDependencies =
    sortAsManyTimesAsNumberOfDependencies(depsWithSubDeps);

  return sortedDependencies;
}
