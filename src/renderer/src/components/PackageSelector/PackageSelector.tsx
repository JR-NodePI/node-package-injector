import { c } from 'fratch-ui/helpers/classNameHelpers';
import { InputCheck, LeftLabeledField, Select } from 'fratch-ui';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import { useEffect, useRef, useState } from 'react';
import BranchSelector from '../BranchSelector/BranchSelector';
import GitService from '@renderer/services/GitService';
import NodeService from '@renderer/services/NodeService';

import styles from './PackageSelector.module.css';
import PackageConfig from '@renderer/models/PackageConfig';

function PackageSelector({
  additionalComponent,
  packageConfig,
  onBranchChange,
  onGitPullChange,
  onPathChange,
  onYarnInstallChange,
}: {
  packageConfig: PackageConfig;
  additionalComponent?: JSX.Element;
  onBranchChange?: (branch?: string) => void;
  onGitPullChange?: (checked: boolean) => void;
  onPathChange?: (cwd: string, isValidPackage: boolean) => void;
  onSyncModeChange?: (checked: boolean) => void;
  onYarnInstallChange?: (checked: boolean) => void;
}): JSX.Element {
  const triggerElementRef = useRef<HTMLInputElement>(null);
  const [statePathDirectories, setPathDirectories] = useState<string[]>();
  const pathDirectories = statePathDirectories ?? [];
  const [directories, setDirectories] = useState<SelectOption<string>[]>([]);

  useEffect(() => {
    if (packageConfig.cwd != null && statePathDirectories == null) {
      const newPathDirectories = packageConfig.cwd.split(/\/|\\/).filter(Boolean);
      setPathDirectories(newPathDirectories);
    }
  }, [packageConfig.cwd, pathDirectories]);

  const cwd = window.api.path.join(...pathDirectories, '/');

  useEffect(() => {
    (async (): Promise<void> => {
      const isValidPackage = await NodeService.checkPackageJSON(cwd);
      const isValidGit = await GitService.checkGit(cwd);
      const isValid = isValidPackage && isValidGit;
      onPathChange?.(cwd, isValid);
    })();
  }, [cwd]);

  useEffect(() => {
    (async (): Promise<void> => {
      const newDirectories = (await window.api.fs.readdir(cwd, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory() && dirent.name[0] !== '.')
        .map(dirent => ({ label: dirent.name, value: dirent.name }));

      setDirectories(newDirectories);
    })();
  }, [cwd]);

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

  const handleOnClickBack = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    event.preventDefault();
    if (pathDirectories.length > 1) {
      const newPathDirectories = [...pathDirectories.slice(0, -1)];
      setPathDirectories(newPathDirectories);
    }
  };

  const backLink = pathDirectories.length > 0 && (
    <a className={c(styles.back)} href="#" onClick={handleOnClickBack}>
      {'../'}
    </a>
  );

  const rootCWD =
    pathDirectories.length > 1
      ? window.api.path
          .join(...pathDirectories.slice(0, -1), '/')
          .replace(
            window.api.path.join(window.electron.process.env.HOME ?? '', '/'),
            window.api.path.join('~', '/')
          )
      : '';

  const lastDirectory = pathDirectories.slice(-1)[0];

  return (
    <div className={c(styles.project)}>
      <LeftLabeledField
        label={
          <>
            {rootCWD}
            <b>{lastDirectory}</b>
            {backLink}
          </>
        }
        field={
          <Select
            key={cwd}
            noResultsElement={backLink}
            onChange={handlePathChange}
            options={directories}
            placeholder="Select directory..."
            searchable
            triggerElementRef={triggerElementRef}
          />
        }
      />
      {packageConfig.isValidPackage && (
        <div className={c(styles.options)}>
          <BranchSelector
            className={c(styles.branch)}
            value={packageConfig.branch}
            key={cwd}
            cwd={cwd}
            onChange={onBranchChange}
          />
          <InputCheck
            checked={packageConfig.performGitPull}
            label="git pull"
            onChange={(event): void => {
              onGitPullChange && onGitPullChange(event.target.checked ?? false);
            }}
          />
          <InputCheck
            checked={packageConfig.performYarnInstall}
            label="yarn install"
            onChange={(event): void => {
              onYarnInstallChange && onYarnInstallChange(event.target.checked ?? false);
            }}
          />
          {additionalComponent}
        </div>
      )}
    </div>
  );
}

export default PackageSelector;
