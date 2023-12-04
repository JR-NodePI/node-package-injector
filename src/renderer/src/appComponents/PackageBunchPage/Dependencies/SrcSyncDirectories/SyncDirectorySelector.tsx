import { useState } from 'react';

import FormValidationRules from '@renderer/appComponents/FormValidation/FormValidationRules';
import type DependencyPackage from '@renderer/models/DependencyPackage';
import SyncDirectory from '@renderer/models/SyncDirectory';
import PathService from '@renderer/services/PathService';
import { InputText, LeftLabeledField, Select } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import DirectoryPathLabel from '../../DirectoryPathLabel/DirectoryPathLabel';
import { DirectorySelectOption } from '../../PackageSelector/PackageSelectorProps';
import { useDirectorySelectOptions } from '../../PackageSelector/useDirectorySelectOptions';
import useEffectCWD from '../../PackageSelector/useEffectCWD';

import styles from './SrcSyncDirectories.module.css';

type SyncDirectorySelectorProps = {
  dependency: DependencyPackage;
  index: number;
  onDirectoriesLoad: (options: DirectorySelectOption[]) => void;
  onSyncDirectoryChange: (syncDirectory: SyncDirectory) => void;
  syncDirectory: SyncDirectory;
  additionalComponent?: JSX.Element;
};

export default function SyncDirectorySelector({
  dependency,
  index,
  onDirectoriesLoad,
  onSyncDirectoryChange,
  syncDirectory,
  additionalComponent,
}: SyncDirectorySelectorProps): JSX.Element {
  const [initialTargetPath] = useState(
    (syncDirectory.targetPath ?? '')
      .replace(syncDirectory.srcPath, '')
      .trim() || undefined
  );
  const [srcPathDirectories, setSrcPathDirectories] = useState(
    PathService.getPathDirectories(syncDirectory.srcPath)
  );

  const cwd = PathService.getPath(srcPathDirectories);

  const directoryOptions = useDirectorySelectOptions({
    cwd: syncDirectory.srcPath,
    onDirectoriesLoad,
  });

  const [initialLength, setInitialLength] = useState<number>(0);
  useEffectCWD(() => {
    setInitialLength(PathService.getPathDirectories(dependency.cwd).length);
  }, dependency.cwd ?? '');
  const isDirBackEnabled = srcPathDirectories.length > initialLength;

  const handleSrcPathChange = (value?: string): void => {
    if (value) {
      const newPathDirectories = [...srcPathDirectories, value];
      setSrcPathDirectories(newPathDirectories);
      onSyncDirectoryChange(
        new SyncDirectory(PathService.getPath(newPathDirectories))
      );
    }
  };

  const handleOnClickBack = (): void => {
    if (isDirBackEnabled) {
      const newPathDirectories = [...srcPathDirectories.slice(0, -1)];
      const newSyncDirectory = new SyncDirectory(
        PathService.getPath(newPathDirectories)
      );
      setSrcPathDirectories(newPathDirectories);
      onSyncDirectoryChange(newSyncDirectory);
    }
  };

  const handleTargetPathChange = (
    event?: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = event?.target?.value || undefined;
    const newTargetPath = value
      ? PathService.getPath(PathService.getPathDirectories(value))
      : undefined;
    const newSyncDirectory = new SyncDirectory(
      PathService.getPath(srcPathDirectories),
      newTargetPath
    );
    onSyncDirectoryChange(newSyncDirectory);
  };

  const srcDirId = `${dependency.id}-${index}-sync-dir`;

  return (
    <div className={c(styles.sync_src)}>
      <LeftLabeledField
        label={
          <DirectoryPathLabel
            id={srcDirId}
            pathDirectories={srcPathDirectories}
            isDirBackEnabled={isDirBackEnabled}
            handleOnClickBack={handleOnClickBack}
          />
        }
        field={
          <div className={c(styles.selectors)}>
            <Select
              title="Src directory..."
              className={c(styles.selectors_src_path)}
              id={srcDirId}
              key={cwd}
              onChange={handleSrcPathChange}
              options={directoryOptions}
              placeholder="Select src directory..."
              searchable
            />
            {index > 0 && (
              <FormValidationRules>
                <InputText
                  title="Write target sub-directory"
                  className={c(styles.target_path_selector)}
                  cleanable
                  placeholder="Write target sub-directory..."
                  value={initialTargetPath}
                  onChange={handleTargetPathChange}
                />
              </FormValidationRules>
            )}
            {additionalComponent}
          </div>
        }
      />
    </div>
  );
}
