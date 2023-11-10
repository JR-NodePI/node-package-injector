import { useCallback, useEffect, useRef, useState } from 'react';

import GitService from '@renderer/services/GitService';
import NodeService from '@renderer/services/NodeService/NodeService';
import PathService from '@renderer/services/PathService';
import { LeftLabeledField, Select } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import DirectoryPathLabel from '../DirectoryPathLabel/DirectoryPathLabel';
import PackageGitActions from './PackageGitActions/PackageGitActions';
import PackageScripts from './PackageScripts/PackageScripts';
import { type PackageSelectorProps } from './PackageSelectorProps';
import { useDirectorySelectOptions } from './useDirectorySelectOptions';
import useEffectCWD from './useEffectCWD';

import styles from './PackageSelector.module.css';

type AllPackageScriptsProps = Pick<
  PackageSelectorProps,
  | 'findInstallScript'
  | 'findBuildScript'
  | 'onScriptsChange'
  | 'onAfterBuildScriptsChange'
  | 'nodePackage'
>;

function AllPackageScripts({
  onScriptsChange,
  onAfterBuildScriptsChange,
  nodePackage,
  findInstallScript,
  findBuildScript,
}: AllPackageScriptsProps): JSX.Element {
  return (
    <>
      <p className={c(styles.scripts_title)}>Package scripts</p>
      <PackageScripts
        onChange={onScriptsChange}
        cwd={nodePackage.cwd}
        selectedScripts={nodePackage.scripts}
        findInstallScript={findInstallScript}
        findBuildScript={findBuildScript}
      />

      {typeof onAfterBuildScriptsChange === 'function' && (
        <>
          <p className={c(styles.scripts_title)}>After build package scripts</p>
          <PackageScripts
            onChange={onAfterBuildScriptsChange}
            cwd={nodePackage.cwd}
            selectedScripts={nodePackage.afterBuildScripts}
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
  disableScripts,
  onPathChange,
  onScriptsChange,
  onAfterBuildScriptsChange,
  nodePackage,
  findInstallScript,
  findBuildScript,
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
        const branch = await GitService.getCurrentBranch(cwd, abortController);
        const isValid =
          isValidPackage && Boolean(packageName) && branch.length > 0;
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

  const directoryOptions = useDirectorySelectOptions({
    cwd,
    onDirectoriesLoad,
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
          {!disableScripts && (
            <AllPackageScripts
              onScriptsChange={onScriptsChange}
              onAfterBuildScriptsChange={onAfterBuildScriptsChange}
              nodePackage={nodePackage}
              findInstallScript={findInstallScript}
              findBuildScript={findBuildScript}
            />
          )}
          {children}
        </>
      )}
    </div>
  );
}
