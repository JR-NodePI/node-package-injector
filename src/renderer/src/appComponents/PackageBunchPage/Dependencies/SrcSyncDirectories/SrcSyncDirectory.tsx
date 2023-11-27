import { useState } from 'react';

import type DependencyPackage from '@renderer/models/DependencyPackage';
import PathService from '@renderer/services/PathService';
import { LeftLabeledField, Select } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import DirectoryPathLabel from '../../DirectoryPathLabel/DirectoryPathLabel';
import { useDirectorySelectOptions } from '../../PackageSelector/useDirectorySelectOptions';
import useEffectCWD from '../../PackageSelector/useEffectCWD';

import styles from './SrcSyncDirectories.module.css';

type SrcSyncDirectoryProps = {
  dependency: DependencyPackage;
  srcSyncDirectory: string;
  onSrcDirChange: (srcDir: string) => void;
};

export default function SrcSyncDirectory({
  dependency,
  srcSyncDirectory,
  onSrcDirChange,
}: SrcSyncDirectoryProps): JSX.Element {
  const [pathDirectories, setPathDirectories] = useState<string[]>(
    PathService.getPathDirectories(srcSyncDirectory || dependency.cwd)
  );

  const cwd = PathService.getPath(pathDirectories);

  const directoryOptions = useDirectorySelectOptions({
    cwd: srcSyncDirectory,
  });

  const [initialLength, setInitialLength] = useState<number>(0);
  useEffectCWD(() => {
    setInitialLength(PathService.getPathDirectories(dependency.cwd).length);
  }, dependency.cwd ?? '');
  const isDirBackEnabled = pathDirectories.length > initialLength;

  const handlePathChange = (value?: string): void => {
    if (value) {
      const newPathDirectories = [...pathDirectories, value];
      setPathDirectories(newPathDirectories);
      onSrcDirChange(PathService.getPath(newPathDirectories));
    }
  };

  const handleOnClickBack = (): void => {
    if (isDirBackEnabled) {
      const newPathDirectories = [...pathDirectories.slice(0, -1)];
      setPathDirectories(newPathDirectories);
      onSrcDirChange(PathService.getPath(newPathDirectories));
    }
  };

  const srcDirId = `${dependency.id}-src-dir`; //TODO: add index to id

  return (
    <div className={c(styles.sync_src)}>
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
