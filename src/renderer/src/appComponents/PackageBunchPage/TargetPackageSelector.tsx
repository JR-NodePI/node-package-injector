import { PackageScript } from '@renderer/models/PackageScript';

import useGlobalData from '../GlobalDataProvider/useGlobalData';
import PackageSelector from './PackageSelector/PackageSelector';

export default function TargetPackageSelector(): JSX.Element {
  const { activeTargetPackage, setActiveTargetPackage } = useGlobalData();

  const handlePathChange = (cwd: string, isValidPackage): void => {
    if (!activeTargetPackage) {
      return;
    }

    if (!isValidPackage) {
      activeTargetPackage.performGitPull = false;
    }
    activeTargetPackage.scripts = [];
    activeTargetPackage.cwd = cwd;
    activeTargetPackage.isValidPackage = isValidPackage;

    setActiveTargetPackage?.(activeTargetPackage);
  };

  const handleGitPullChange = (checked?: boolean): void => {
    if (activeTargetPackage) {
      activeTargetPackage.performGitPull = checked ?? false;
      setActiveTargetPackage?.(activeTargetPackage);
    }
  };

  const handleScriptsChange = (scripts: PackageScript[]): void => {
    if (activeTargetPackage) {
      activeTargetPackage.scripts = scripts;
      setActiveTargetPackage?.(activeTargetPackage);
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
