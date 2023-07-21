import { memo, useEffect, useRef, useState } from 'react';

import PackageConfig from '@renderer/models/PackageConfig';
import GitService from '@renderer/services/GitService';
import NPMService from '@renderer/services/NPMService';
import PathService from '@renderer/services/PathService';
import { InputCheck, LeftLabeledField, Select } from 'fratch-ui';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import BranchSelector from '../BranchSelector/BranchSelector';
import LinkButton from '../linkButton/LinkButton';

import styles from './PackageSelector.module.css';

function PackageSelector({
  disabled,
  excludedDirectories,
  additionalComponent,
  packageConfig,
  onGitPullChange,
  onPathChange,
  onYarnInstallChange,
}: {
  disabled?: boolean;
  excludedDirectories?: string[];
  packageConfig?: PackageConfig;
  additionalComponent?: JSX.Element;
  onGitPullChange?: (checked?: boolean) => void;
  onPathChange?: (cwd: string, isValidPackage: boolean) => void;
  onYarnInstallChange?: (checked?: boolean) => void;
}): JSX.Element {
  const triggerElementRef = useRef<HTMLInputElement>(null);
  const [statePathDirectories, setPathDirectories] = useState<string[]>();
  const pathDirectories = statePathDirectories ?? [];
  const [directories, setDirectories] = useState<SelectOption<string>[]>([]);

  useEffect(() => {
    if ((packageConfig?.cwd ?? '').length > 2 && statePathDirectories == null) {
      const newPathDirectories = PathService.getPathDirectories(
        packageConfig?.cwd
      );
      setPathDirectories(newPathDirectories);
    }
  }, [packageConfig?.cwd, pathDirectories]);

  const cwd = PathService.getPath(pathDirectories);

  const [isValidating, setIsValidating] = useState<boolean>(true);
  useEffect(() => {
    if (cwd.length > 2) {
      (async (): Promise<void> => {
        setIsValidating(true);
        const isValidPackage = await NPMService.checkPackageJSON(cwd);
        const isValidGit = await GitService.checkGit(cwd);
        const isValid = isValidPackage && isValidGit;

        if (!isValid) {
          onGitPullChange?.(undefined);
          onYarnInstallChange?.(undefined);
        }

        setIsValidating(false);
        onPathChange?.(cwd, isValid);
      })();
    }
  }, [cwd]);

  useEffect(() => {
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
  }, [cwd, excludedDirectories]);

  const handlePathChange = (value?: string): void => {
    if (value) {
      const newPathDirectories = [...pathDirectories, value];
      setPathDirectories(newPathDirectories);
    }
    // wait to focus the trigger input element again
    setTimeout(() => {
      triggerElementRef.current?.focus();
    }, 10);
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
    <div className={c(styles.project)}>
      <LeftLabeledField
        label={
          <>
            {rootPath}
            <b>{lastDirectory}</b>
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
          <Select
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
      {packageConfig?.isValidPackage && (
        <div className={c(styles.options)}>
          <BranchSelector
            disabled={isDisabled}
            className={c(styles.branch)}
            cwd={cwd}
          />
          <InputCheck
            disabled={isDisabled}
            checked={packageConfig.performGitPull}
            label="git pull"
            onChange={(event): void => {
              onGitPullChange && onGitPullChange(event.target.checked ?? false);
            }}
          />
          <InputCheck
            disabled={isDisabled}
            checked={packageConfig.performYarnInstall}
            label="yarn install"
            onChange={(event): void => {
              onYarnInstallChange &&
                onYarnInstallChange(event.target.checked ?? false);
            }}
          />
          {additionalComponent}
        </div>
      )}
    </div>
  );
}

export default memo(PackageSelector);
