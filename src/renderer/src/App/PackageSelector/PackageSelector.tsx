import { memo, useRef, useState } from 'react';

import GitService from '@renderer/services/GitService';
import NPMService from '@renderer/services/NPMService';
import PathService from '@renderer/services/PathService';
import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { v4 as uuid } from 'uuid';

import LinkButton from '../../components/linkButton/LinkButton';
import PackageScripts from '../PackageScripts/PackageScripts';
import PackageBranchSelector from './PackageBranchSelector';
import { type PackageSelectorProps } from './PackageSelectorProps';
import useEffectCWD from './useEffectCWD';

import styles from './PackageSelector.module.css';

function PackageSelector({
  additionalComponent,
  disabled,
  excludedDirectories,
  onGitPullChange,
  onPathChange,
  onScriptsChange,
  targetPackage,
}: PackageSelectorProps): JSX.Element {
  const [id] = useState<string>(uuid());
  const triggerElementRef = useRef<HTMLInputElement>(null);
  const [statePathDirectories, setPathDirectories] = useState<string[]>();
  const pathDirectories = statePathDirectories ?? [];
  const [directories, setDirectories] = useState<
    Form.SelectProps.SelectOption<string>[]
  >([]);

  useDeepCompareEffect(() => {
    if ((targetPackage?.cwd ?? '').length > 2 && statePathDirectories == null) {
      const newPathDirectories = PathService.getPathDirectories(
        targetPackage?.cwd
      );
      setPathDirectories(newPathDirectories);
    }
  }, [targetPackage?.cwd, pathDirectories, statePathDirectories]);

  const cwd = PathService.getPath(pathDirectories);

  const [isValidating, setIsValidating] = useState<boolean>(true);
  useEffectCWD(() => {
    if (cwd.length > 2) {
      (async (): Promise<void> => {
        setIsValidating(true);
        const isValidPackage = await NPMService.checkPackageJSON(cwd);
        const isValidGit = await GitService.checkGit(cwd);
        const isValid = isValidPackage && isValidGit;
        setIsValidating(false);
        onPathChange?.(cwd, isValid);
      })();
    }
  }, cwd);

  useEffectCWD(() => {
    if (cwd.length > 2) {
      (async (): Promise<void> => {
        const newDirectories = (
          await window.api.fs.readdir(cwd, { withFileTypes: true })
        )
          .filter(dirent => dirent.isDirectory() && dirent.name[0] !== '.')
          .filter(dirent => {
            const path = window.api.path.join(cwd, dirent.name, '/');
            return (excludedDirectories ?? []).includes(path) === false;
          })
          .map(dirent => ({ label: dirent.name, value: dirent.name }));
        setDirectories(newDirectories);
      })();
    }
  }, cwd);

  const handlePathChange = (value?: string): void => {
    if (value) {
      const newPathDirectories = [...pathDirectories, value];
      setPathDirectories(newPathDirectories);
    }
    setTimeout(() => {
      triggerElementRef.current?.focus();
    }, 200);
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

  const isDisabled = disabled || isValidating;

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
            options={directories}
            placeholder="Select directory..."
            searchable
            triggerElementRef={triggerElementRef}
          />
        }
      />
      {targetPackage?.isValidPackage && (
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
