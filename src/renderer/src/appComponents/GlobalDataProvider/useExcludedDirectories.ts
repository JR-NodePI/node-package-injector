import useGlobalData from './useGlobalData';

const useExcludedDirectories = (): string[] => {
  const { packageBunches } = useGlobalData();

  const activeBunch = packageBunches.find(bunch => bunch.active);
  const activeTargetPackage = activeBunch?.targetPackage;
  const activeDependencies = activeBunch?.dependencies;

  const dependenciesDirectories = (activeDependencies ?? []).map(
    ({ cwd, isValidPackage }) => (isValidPackage ? cwd : '') ?? ''
  );

  const excludedDirectories = [
    (activeTargetPackage?.isValidPackage ? activeTargetPackage?.cwd : '') ?? '',
    ...dependenciesDirectories,
  ].filter(Boolean);

  return excludedDirectories;
};

export default useExcludedDirectories;
