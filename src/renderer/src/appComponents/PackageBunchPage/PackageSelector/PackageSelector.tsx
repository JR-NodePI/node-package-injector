import { useCallback, useEffect, useRef, useState } from 'react';

import useExcludedDirectories from '@renderer/appComponents/GlobalDataProvider/useExcludedDirectories';
import NodeService from '@renderer/services/NodeService/NodeService';
import PathService from '@renderer/services/PathService';
import { LeftLabeledField, Select } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import DirectoryPathLabel from '../DirectoryPathLabel/DirectoryPathLabel';
import PackageGitActions from './PackageGitActions/PackageGitActions';
import PackageOpenButtons from './PackageOpenButtons';
import PackageScriptsSelectors from './PackageScriptsSelectors';
import { type PackageSelectorProps } from './PackageSelectorProps';
import { useDirectorySelectOptions } from './useDirectorySelectOptions';
import useEffectCWD from './useEffectCWD';

import styles from './PackageSelector.module.css';

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
            <PackageScriptsSelectors
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
