import { useCallback, useState } from 'react';

import PathService from '@renderer/services/PathService';
import { LeftLabeledField, Select } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import DirectoryPathLabel from '../DirectoryPathLabel/DirectoryPathLabel';
import { useDirectorySelectOptions } from '../PackageSelector/useDirectorySelectOptions';
import useEffectCWD from '../PackageSelector/useEffectCWD';
import { DependencySelectorProps } from './DependencySelectorProps';

import styles from './DependencySelector.module.css';

const SRC_DEFAULT_DIR = 'src';

export default function DependencySyncSrcDirectory({
  dependency,
  onSrcSyncChange,
}: Pick<
  DependencySelectorProps,
  'dependency' | 'onSrcSyncChange'
>): JSX.Element {
  const [pathDirectories, setPathDirectories] = useState<string[]>(
    PathService.getPathDirectories(dependency.srcSyncPath || dependency.cwd)
  );

  const cwd = PathService.getPath(pathDirectories);

  const [initialLength, setInitialLength] = useState<number>(0);
  useEffectCWD(() => {
    setInitialLength(PathService.getPathDirectories(dependency.cwd).length);
  }, dependency.cwd ?? '');
  const isDirBackEnabled = pathDirectories.length > initialLength;

  const onDirectoriesLoad = useCallback(
    (options): void => {
      if (dependency.srcSyncPath != null) {
        return;
      }

      const hasSrc = options.some(({ value }) => value === SRC_DEFAULT_DIR);
      if (hasSrc) {
        const newPathDirectories = [...pathDirectories, SRC_DEFAULT_DIR];
        setPathDirectories(newPathDirectories);
        onSrcSyncChange(dependency, PathService.getPath(newPathDirectories));
      } else {
        onSrcSyncChange(dependency, PathService.getPath(pathDirectories));
      }
    },
    [dependency, onSrcSyncChange, pathDirectories]
  );

  const directoryOptions = useDirectorySelectOptions({
    cwd,
    onDirectoriesLoad,
  });

  const handlePathChange = (value?: string): void => {
    if (value) {
      const newPathDirectories = [...pathDirectories, value];
      setPathDirectories(newPathDirectories);
      onSrcSyncChange(dependency, PathService.getPath(newPathDirectories));
    }
  };

  const handleOnClickBack = (): void => {
    if (isDirBackEnabled) {
      const newPathDirectories = [...pathDirectories.slice(0, -1)];
      setPathDirectories(newPathDirectories);
      onSrcSyncChange(dependency, PathService.getPath(newPathDirectories));
    }
  };

  const srcDirId = `${dependency.id}-src-dir`;

  return (
    <div className={c(styles.sync_src)}>
      <p className={c(styles.sync_src_title)}>Source code directory to sync</p>
      <LeftLabeledField
        label={
          <DirectoryPathLabel
            id={srcDirId}
            pathDirectories={pathDirectories}
            isDirBackEnabled={isDirBackEnabled}
            handleOnClickBack={handleOnClickBack}
          />
        }
        field={
          <Select
            id={srcDirId}
            key={cwd}
            onChange={handlePathChange}
            options={directoryOptions}
            placeholder="Select directory..."
            searchable
          />
        }
      />
    </div>
  );
}
