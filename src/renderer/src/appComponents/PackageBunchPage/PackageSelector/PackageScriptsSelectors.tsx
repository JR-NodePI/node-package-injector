import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import LastSelectedScripts from '@renderer/models/LastSelectedScripts';
import PackageScript from '@renderer/models/PackageScript';
import { c } from 'fratch-ui/helpers';

import PackageScripts from './PackageScripts/PackageScripts';
import { type PackageSelectorProps } from './PackageSelectorProps';

import styles from './PackageSelector.module.css';

type PackageScriptsSelectorsProps = Pick<
  PackageSelectorProps,
  | 'nodePackage'
  | 'onPostBuildScriptsChange'
  | 'onPreInstallScriptsChange'
  | 'onScriptsChange'
  | 'packageType'
  | 'scriptsLabel'
  | 'scriptsLabelPostBuild'
  | 'scriptsLabelPreInstall'
>;

export default function PackageScriptsSelectors({
  nodePackage,
  onPostBuildScriptsChange,
  onPreInstallScriptsChange,
  onScriptsChange,
  scriptsLabel,
  scriptsLabelPostBuild,
  scriptsLabelPreInstall,
  packageType,
}: PackageScriptsSelectorsProps): JSX.Element {
  const { getLastSelectedScripts, setLastSelectedScripts } = useGlobalData();

  const enablePreInstallScripts =
    typeof onPreInstallScriptsChange === 'function';

  const enablePostBuildScripts = typeof onPostBuildScriptsChange === 'function';

  const handleSetLastSelectedScripts = (
    scriptsKey:
      | 'targetScripts'
      | 'targetPostBuildScripts'
      | 'dependencyPreBuildScripts'
      | 'dependencyScripts',
    scripts: PackageScript[]
  ): void => {
    const newLastSelectedScripts =
      getLastSelectedScripts?.(nodePackage.packageName ?? '') ??
      new LastSelectedScripts(nodePackage.packageName ?? '');
    newLastSelectedScripts[scriptsKey] = scripts;
    setLastSelectedScripts?.(newLastSelectedScripts);
  };

  const handleOnPreInstallScriptsChange = (scripts: PackageScript[]): void => {
    onPreInstallScriptsChange?.(scripts);
    if (packageType == 'dependency') {
      handleSetLastSelectedScripts?.('dependencyPreBuildScripts', scripts);
    }
  };

  const handleOnScriptsChange = (scripts: PackageScript[]): void => {
    onScriptsChange?.(scripts);
    if (packageType == 'target') {
      handleSetLastSelectedScripts?.('targetScripts', scripts);
    }
    if (packageType == 'dependency') {
      handleSetLastSelectedScripts?.('dependencyScripts', scripts);
    }
  };

  const handleOnPostBuildScriptsChange = (scripts: PackageScript[]): void => {
    onPostBuildScriptsChange?.(scripts);
    if (packageType == 'target') {
      handleSetLastSelectedScripts?.('targetPostBuildScripts', scripts);
    }
  };

  return (
    <>
      {enablePreInstallScripts && nodePackage.cwd && (
        <>
          <p className={c(styles.scripts_title)}>{scriptsLabelPreInstall}</p>
          <PackageScripts
            cwd={nodePackage.cwd}
            onChange={handleOnPreInstallScriptsChange}
            scriptsType="preBuildScripts"
            selectedScripts={nodePackage.preBuildScripts}
          />
        </>
      )}
      {nodePackage.cwd && (
        <>
          <p className={c(styles.scripts_title)}>{scriptsLabel}</p>
          <PackageScripts
            cwd={nodePackage.cwd}
            enablePostBuildScripts={enablePostBuildScripts}
            enablePreInstallScripts={enablePreInstallScripts}
            onChange={handleOnScriptsChange}
            scriptsType="scripts"
            selectedScripts={nodePackage.scripts}
          />
        </>
      )}
      {enablePostBuildScripts && nodePackage.cwd && (
        <>
          <p className={c(styles.scripts_title)}>{scriptsLabelPostBuild}</p>
          <PackageScripts
            cwd={nodePackage.cwd}
            onChange={handleOnPostBuildScriptsChange}
            scriptsType="postBuildScripts"
            selectedScripts={nodePackage.postBuildScripts}
          />
        </>
      )}
    </>
  );
}
