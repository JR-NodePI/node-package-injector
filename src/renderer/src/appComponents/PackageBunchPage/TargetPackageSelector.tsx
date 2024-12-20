import PackageScript from '@renderer/models/PackageScript';

import useGlobalData from '../GlobalDataProvider/useGlobalData';
import PackageSelector from './PackageSelector/PackageSelector';

export default function TargetPackageSelector(): JSX.Element {
  const { activeTargetPackage, setActiveTargetPackage } = useGlobalData();

  const handlePathChange = (
    cwd: string,
    isValidPackage: boolean,
    packageName?: string
  ): void => {
    if (!activeTargetPackage || activeTargetPackage.cwd === cwd) {
      return;
    }

    const clonedPackage = activeTargetPackage.clone();

    clonedPackage.cwd = cwd;
    clonedPackage.preBuildScripts = undefined;
    clonedPackage.scripts = undefined;
    clonedPackage.postBuildScripts = undefined;
    clonedPackage.isValidPackage = isValidPackage;
    clonedPackage.packageName = packageName;

    setActiveTargetPackage?.(clonedPackage);
  };

  const handleScriptsChange = (scripts: PackageScript[]): void => {
    if (activeTargetPackage) {
      const clonedPackage = activeTargetPackage.clone();
      clonedPackage.scripts = scripts;
      setActiveTargetPackage?.(clonedPackage);
    }
  };

  const onPostBuildScriptsChange = (scripts: PackageScript[]): void => {
    if (activeTargetPackage) {
      const clonedPackage = activeTargetPackage.clone();
      clonedPackage.postBuildScripts = scripts;
      setActiveTargetPackage?.(clonedPackage);
    }
  };

  return (
    <PackageSelector
      enablePackageScriptsSelectors
      nodePackage={activeTargetPackage}
      onPathChange={handlePathChange}
      onPostBuildScriptsChange={onPostBuildScriptsChange}
      onScriptsChange={handleScriptsChange}
      scriptsLabel="Scripts (pre build)"
      scriptsLabelPostBuild="Scripts (post build)"
    />
  );
}
