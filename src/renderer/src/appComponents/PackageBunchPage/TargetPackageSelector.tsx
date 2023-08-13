import PackageScript from '@renderer/models/PackageScript';

import useGlobalData from '../GlobalDataProvider/useGlobalData';
import PackageSelector from './PackageSelector/PackageSelector';

export default function TargetPackageSelector(): JSX.Element {
  const { activeTargetPackage, setActiveTargetPackage } = useGlobalData();

  const handlePathChange = (cwd: string, isValidPackage): void => {
    if (!activeTargetPackage) {
      return;
    }

    const clonedPackage = activeTargetPackage.clone();

    if (!isValidPackage) {
      clonedPackage.performGitPull = false;
    }
    clonedPackage.scripts = [];
    clonedPackage.cwd = cwd;
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

  return (
    <PackageSelector
      onGitPullChange={handleGitPullChange}
      onPathChange={handlePathChange}
      onScriptsChange={handleScriptsChange}
      targetPackage={activeTargetPackage}
    />
  );
}
