import { DependencyMode } from '@renderer/models/DependencyConstants';
import DependencyPackage from '@renderer/models/DependencyPackage';

import NodeService from './NodeService';

type DepRelation = [string, string[]];

const getDepPosition = (
  deps: DepRelation[],
  currentDep: DepRelation,
  currentIndex: number
): number =>
  deps.reduce<number>(
    (position, dep, index) =>
      dep[1].includes(currentDep[0]) ? index : position,
    currentIndex
  );

const reduceSorting = (deps: DepRelation[]): DepRelation[] =>
  deps.reduce<DepRelation[]>((sorted, dep, index) => {
    const position = getDepPosition(sorted, dep, index);
    return sorted.toSpliced(position, 0, dep);
  }, []);

const sortAsManyTimesAsNumberOfDependencies = (
  deps: DepRelation[]
): DepRelation[] => {
  return Array(deps.length)
    .fill(null)
    .reduce(sortedDeps => reduceSorting(sortedDeps), deps);
};

export default async function getDependenciesSortedByHierarchy(
  dependencies: DependencyPackage[]
): Promise<DepRelation[]> {
  const buildModeDeps = dependencies.filter(
    ({ mode }) => mode === DependencyMode.BUILD
  );

  const allDepNames = await Promise.all(
    buildModeDeps.map(async ({ cwd }) => await NodeService.getPackageName(cwd))
  );

  const depsRelated = await Promise.all(
    buildModeDeps.map(async ({ cwd }): Promise<DepRelation> => {
      const packageName = (await NodeService.getPackageName(cwd)) ?? '';
      const npmDepNames = (await NodeService.getDependenciesNames(cwd)) ?? [];
      const depsRelated = npmDepNames.filter(packageName =>
        allDepNames.includes(packageName)
      );
      return [packageName, depsRelated];
    })
  );

  const sortedDepsRelated = sortAsManyTimesAsNumberOfDependencies(depsRelated);

  return sortedDepsRelated;
}
