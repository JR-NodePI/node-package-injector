import useGlobalData from './useGlobalData';

const useExcludedDirectories = (): string[] => {
  const { packageBunches } = useGlobalData();

  const activeBunch = packageBunches.find(bunch => bunch.active);
  const activeTargetPackage = activeBunch?.targetPackage;
  const activeDependencies = activeBunch?.dependencies;

  const dependenciesDirectories =
    activeDependencies?.map(({ cwd }) => cwd ?? '').filter(Boolean) ?? [];

  const excludedDirectories = [
    activeTargetPackage?.cwd ?? '',
    ...dependenciesDirectories,
  ];

  return excludedDirectories;
};

export default useExcludedDirectories;
