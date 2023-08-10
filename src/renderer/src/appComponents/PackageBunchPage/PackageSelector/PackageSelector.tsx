import { memo, useRef, useState } from 'react';

import GitService from '@renderer/services/GitService';
import NPMService from '@renderer/services/NPMService';
import PathService from '@renderer/services/PathService';
import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import { v4 as uuid } from 'uuid';

import LinkButton from '../../../components/linkButton/LinkButton';
import PackageBranchSelector from './PackageBranchSelector';
import PackageScripts from './PackageScripts/PackageScripts';
import { type PackageSelectorProps } from './PackageSelectorProps';
import { useDirectorySelectOptions } from './useDirectorySelectOptions';
import useEffectCWD from './useEffectCWD';

import styles from './PackageSelector.module.css';

function PackageSelector({
  additionalComponent,
  disabled,
  onGitPullChange,
  onPathChange,
  onScriptsChange,
  targetPackage,
}: PackageSelectorProps): JSX.Element {
  const [id] = useState<string>(uuid());

  const triggerElementRef = useRef<HTMLInputElement>(null);
  const refMustFocusOnDirectoriesLoaded = useRef<boolean>(false);

  const [pathDirectories, setPathDirectories] = useState<string[]>(
    PathService.getPathDirectories(targetPackage?.cwd)
  );
  const cwd = PathService.getPath(pathDirectories);

  const [isValidatingPackage, setIsValidatingPackage] = useState<boolean>(true);
  useEffectCWD(() => {
    if (cwd.length > 2) {
      setIsValidatingPackage(true);
      (async (): Promise<void> => {
        const isValidPackage = await NPMService.checkPackageJSON(cwd);
        const isValidGit = await GitService.checkGit(cwd);
        const isValid = isValidPackage && isValidGit;
        onPathChange?.(cwd, isValid);
        setIsValidatingPackage(false);
      })();
    }
  }, cwd);

  const directoryOptions = useDirectorySelectOptions({
    cwd,
    onDirectoriesLoad: (): void => {
      if (refMustFocusOnDirectoriesLoaded.current) {
        triggerElementRef.current?.focus();
        refMustFocusOnDirectoriesLoaded.current = false;
      }
    },
  });

  const handlePathChange = (value?: string): void => {
    if (value) {
      setPathDirectories([...pathDirectories, value]);
      refMustFocusOnDirectoriesLoaded.current = true;
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
          <>
            <label htmlFor={id}>
              {rootPath}
              <b>{lastDirectory}</b>
            </label>
            {isDirBackEnabled && (
              <LinkButton
                title="go back to previous"
                onClick={handleOnClickBack}
              >
                ../
              </LinkButton>
            )}
          </>
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
            <PackageBranchSelector
              disabled={isDisabled}
              className={c(styles.branch)}
              cwd={cwd}
            />
            <Form.InputCheck
              disabled={disabled}
              checked={targetPackage.performGitPull}
              label="git pull"
              onChange={(event): void => {
                onGitPullChange &&
                  onGitPullChange(event.target.checked ?? false);
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

export default memo(PackageSelector);
