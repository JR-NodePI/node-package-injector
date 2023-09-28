import PackageScript from '@renderer/models/PackageScript';

import useGlobalData from '../GlobalDataProvider/useGlobalData';
import PackageSelector from './PackageSelector/PackageSelector';

export default function TargetPackageSelector(): JSX.Element {
  const { activeTargetPackage, setActiveTargetPackage } = useGlobalData();

  const handlePathChange = (cwd: string, isValidPackage): void => {
    if (!activeTargetPackage || activeTargetPackage.cwd === cwd) {
      return;
    }

    const clonedPackage = activeTargetPackage.clone();

    if (!isValidPackage) {
      clonedPackage.performGitPull = false;
    }
    clonedPackage.cwd = cwd;
    clonedPackage.scripts = undefined;
    clonedPackage.afterBuildScripts = undefined;
    clonedPackage.isValidPackage = isValidPackage;

    setActiveTargetPackage?.(clonedPackage);
  };

  const handleGitPullChange = (checked?: boolean): void => {
    if (activeTargetPackage) {
      const clonedPackage = activeTargetPackage.clone();
      clonedPackage.performGitPull = checked ?? false;
      setActiveTargetPackage?.(clonedPackage);
    }
  };

  const handleScriptsChange = (scripts: PackageScript[]): void => {
    if (activeTargetPackage) {
      const clonedPackage = activeTargetPackage.clone();
      clonedPackage.scripts = scripts;
      setActiveTargetPackage?.(clonedPackage);
    }
  };

  const onAfterBuildScriptsChange = (scripts: PackageScript[]): void => {
    if (activeTargetPackage) {
      const clonedPackage = activeTargetPackage.clone();
      clonedPackage.afterBuildScripts = scripts;
      setActiveTargetPackage?.(clonedPackage);
    }
  };

  return (
    <PackageSelector
      onGitPullChange={handleGitPullChange}
      onPathChange={handlePathChange}
      onScriptsChange={handleScriptsChange}
      onAfterBuildScriptsChange={onAfterBuildScriptsChange}
      nodePackage={activeTargetPackage}
      findInstallScript
    />
  );
}
