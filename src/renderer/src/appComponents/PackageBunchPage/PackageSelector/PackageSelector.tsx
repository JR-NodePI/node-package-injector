import { useCallback, useEffect, useRef, useState } from 'react';

import useExcludedDirectories from '@renderer/appComponents/GlobalDataProvider/useExcludedDirectories';
import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import LastSelectedScripts from '@renderer/models/LastSelectedScripts';
import PackageScript from '@renderer/models/PackageScript';
import NodeService from '@renderer/services/NodeService/NodeService';
import PathService from '@renderer/services/PathService';
import { LeftLabeledField, Select } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import DirectoryPathLabel from '../DirectoryPathLabel/DirectoryPathLabel';
import PackageGitActions from './PackageGitActions/PackageGitActions';
import PackageOpenButtons from './PackageOpenButtons';
import PackageScripts from './PackageScripts/PackageScripts';
import { type PackageSelectorProps } from './PackageSelectorProps';
import { useDirectorySelectOptions } from './useDirectorySelectOptions';
import useEffectCWD from './useEffectCWD';

import styles from './PackageSelector.module.css';

type AllPackageScriptsProps = Pick<
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

function AllPackageScripts({
  nodePackage,
  onPostBuildScriptsChange,
  onPreInstallScriptsChange,
  onScriptsChange,
  scriptsLabel,
  scriptsLabelPostBuild,
  scriptsLabelPreInstall,
  packageType,
}: AllPackageScriptsProps): JSX.Element {
  const { getLastSelectedScripts, setLastSelectedScripts } = useGlobalData();

  const enablePreInstallScripts =
    typeof onPreInstallScriptsChange === 'function';

  const enablePostBuildScripts = typeof onPostBuildScriptsChange === 'function';

  let preBuildScripts = nodePackage.preBuildScripts;
  let scripts = nodePackage.scripts;
  let postBuildScripts = nodePackage.postBuildScripts;

  const lastSelectedScripts = getLastSelectedScripts?.(
    nodePackage.packageName ?? ''
  );

  if (lastSelectedScripts && packageType == 'target') {
    postBuildScripts =
      postBuildScripts ?? lastSelectedScripts?.targetPostBuildScripts;
    scripts = scripts ?? lastSelectedScripts?.targetScripts;
  }

  if (lastSelectedScripts && packageType == 'dependency') {
    preBuildScripts =
      preBuildScripts ?? lastSelectedScripts?.dependencyPreBuildScripts;
    scripts = scripts ?? lastSelectedScripts?.dependencyScripts;
  }

  const handleSetLastSelectedScripts = (
    scriptsKey:
      | 'targetScripts'
      | 'targetPostBuildScripts'
      | 'dependencyPreBuildScripts'
      | 'dependencyScripts',
    scripts: PackageScript[]
  ): void => {
    const newLastSelectedScripts =
      lastSelectedScripts ??
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
            selectedScripts={preBuildScripts}
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
            selectedScripts={scripts}
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
            selectedScripts={postBuildScripts}
          />
        </>
      )}
    </>
  );
}

export default function PackageSelector({
  additionalActionComponents,
  children,
  disabled,
  enablePackageScriptsSelectors,
  nodePackage,
  onPathChange,
  onPostBuildScriptsChange,
  onPreInstallScriptsChange,
  onScriptsChange,
  packageType,
  scriptsLabel,
  scriptsLabelPostBuild,
  scriptsLabelPreInstall,
}: PackageSelectorProps): JSX.Element {
  const [id] = useState<string>(crypto.randomUUID());

  const [pathDirectories, setPathDirectories] = useState<string[]>(
    PathService.getPathDirectories(nodePackage.cwd)
  );
  const cwd = PathService.getPath(pathDirectories);

  const [isValidatingPackage, setIsValidatingPackage] = useState<boolean>(true);

  useEffectCWD(() => {
    const abortController = new AbortController();

    if (cwd.length > 2) {
      setIsValidatingPackage(true);

      (async (): Promise<void> => {
        const isValidPackage = await NodeService.checkPackageJSON(cwd);
        const packageName = isValidPackage
          ? await NodeService.getPackageName(cwd)
          : undefined;

        const isValid = isValidPackage && Boolean(packageName);
        if (!abortController.signal.aborted) {
          onPathChange(cwd, isValid, packageName);
        }
        setIsValidatingPackage(false);
      })();
    }

    return (): void => {
      abortController.abort();
    };
  }, cwd);

  const triggerElementRef = useRef<HTMLInputElement>(null);
  const refShouldFocus = useRef<boolean>(false);
  const [shouldFocus, setShouldFocus] = useState<boolean>(false);

  const onDirectoriesLoad = useCallback((): void => {
    setShouldFocus(refShouldFocus.current);
    refShouldFocus.current = false;
  }, []);

  const excludedDirectories = useExcludedDirectories();
  const directoryOptions = useDirectorySelectOptions({
    cwd,
    onDirectoriesLoad,
    excludedDirectories,
  });

  useEffect(() => {
    if (shouldFocus && !isValidatingPackage) {
      triggerElementRef.current?.focus();
    }
  }, [shouldFocus, isValidatingPackage]);

  const handlePathChange = (value?: string): void => {
    if (value) {
      setPathDirectories([...pathDirectories, value]);
      refShouldFocus.current = true;
    }
  };

  const isDirBackEnabled =
    !disabled && PathService.isWSL(pathDirectories?.[0] ?? '')
      ? pathDirectories.length > 3
      : pathDirectories.length > 2;

  const handleOnClickBack = (): void => {
    if (isDirBackEnabled) {
      const newPathDirectories = [...pathDirectories.slice(0, -1)];
      setPathDirectories(newPathDirectories);
    }
  };

  const isDisabled = disabled || isValidatingPackage;

  return (
    <div className={c(styles.package)}>
      <LeftLabeledField
        label={
          <DirectoryPathLabel
            id={id}
            handleOnClickBack={handleOnClickBack}
            isDirBackEnabled={isDirBackEnabled}
            pathDirectories={pathDirectories}
            additionalComponent={
              <PackageOpenButtons nodePackage={nodePackage} />
            }
          />
        }
        field={
          <Select
            id={id}
            disabled={isDisabled}
            key={cwd}
            onChange={handlePathChange}
            options={directoryOptions}
            placeholder="Select directory..."
            searchable
            triggerElementRef={triggerElementRef}
          />
        }
      />
      {!isValidatingPackage && nodePackage.isValidPackage && (
        <>
          <div className={c(styles.options)}>
            <PackageGitActions
              disabled={isDisabled}
              className={c(styles.branch)}
              cwd={cwd}
            />
            {additionalActionComponents}
          </div>

          {enablePackageScriptsSelectors && (
            <AllPackageScripts
              nodePackage={nodePackage}
              onPostBuildScriptsChange={onPostBuildScriptsChange}
              onPreInstallScriptsChange={onPreInstallScriptsChange}
              onScriptsChange={onScriptsChange}
              packageType={packageType}
              scriptsLabel={scriptsLabel}
              scriptsLabelPostBuild={scriptsLabelPostBuild}
              scriptsLabelPreInstall={scriptsLabelPreInstall}
            />
          )}

          {children}
        </>
      )}
    </div>
  );
}
