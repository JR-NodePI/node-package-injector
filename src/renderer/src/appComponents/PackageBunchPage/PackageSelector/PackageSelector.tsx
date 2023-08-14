import { useEffect, useRef, useState } from 'react';

import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import GitService from '@renderer/services/GitService';
import NodeService from '@renderer/services/NodeService';
import PathService from '@renderer/services/PathService';

import BranchSelector from './BranchSelector';
import PackageScripts from './PackageScripts/PackageScripts';
import PackageSelectorLabel from './PackageSelectorLabel';
import { type PackageSelectorProps } from './PackageSelectorProps';
import { useDirectorySelectOptions } from './useDirectorySelectOptions';
import useEffectCWD from './useEffectCWD';

import styles from './PackageSelector.module.css';

export default function PackageSelector({
  additionalComponent,
  disabled,
  onGitPullChange,
  onPathChange,
  onScriptsChange,
  targetPackage,
}: PackageSelectorProps): JSX.Element {
  const [id] = useState<string>(crypto.randomUUID());

  const [pathDirectories, setPathDirectories] = useState<string[]>(
    PathService.getPathDirectories(targetPackage?.cwd)
  );
  const cwd = PathService.getPath(pathDirectories);

  const [isValidatingPackage, setIsValidatingPackage] = useState<boolean>(true);
  const [gitBranch, setGitBranch] = useState<string>();

  useEffectCWD(() => {
    const abortController = new AbortController();

    if (cwd.length > 2) {
      setIsValidatingPackage(true);

      (async (): Promise<void> => {
        const isValidPackage = await NodeService.checkPackageJSON(cwd);
        const branch = await GitService.getCurrentBranch(cwd, abortController);
        const isValid = isValidPackage && branch.length > 0;
        if (!abortController.signal.aborted) {
          setGitBranch(branch);
          onPathChange?.(cwd, isValid);
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
  const directoryOptions = useDirectorySelectOptions({
    cwd,
    onDirectoriesLoad: (): void => {
      setShouldFocus(refShouldFocus.current);
      refShouldFocus.current = false;
    },
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

  const rootPath =
    pathDirectories.length > 1
      ? PathService.getPath(pathDirectories.slice(0, -1))
      : '';

  const lastDirectory =
    pathDirectories.length > 1 ? pathDirectories.slice(-1)[0] : '';

  const isDisabled = disabled || isValidatingPackage;

  return (
    <div className={c(styles.package)}>
      <Form.LeftLabeledField
        label={
          <PackageSelectorLabel
            id={id}
            rootPath={rootPath}
            lastDirectory={lastDirectory}
            isDirBackEnabled={isDirBackEnabled}
            handleOnClickBack={handleOnClickBack}
          />
        }
        field={
          <Form.Select
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
      {!isValidatingPackage && targetPackage?.isValidPackage && (
        <>
          <div className={c(styles.options)}>
            <BranchSelector
              currentBranch={gitBranch}
              disabled={isDisabled}
              className={c(styles.branch)}
              cwd={cwd}
            />
            <Form.InputCheck
              disabled={disabled}
              checked={targetPackage.performGitPull}
              label="git pull"
              onChange={(checked): void => {
                onGitPullChange && onGitPullChange(checked ?? false);
              }}
            />
            {additionalComponent}
          </div>
          <PackageScripts
            onChange={onScriptsChange}
            targetPackage={targetPackage}
          />
        </>
      )}
    </div>
  );
}
