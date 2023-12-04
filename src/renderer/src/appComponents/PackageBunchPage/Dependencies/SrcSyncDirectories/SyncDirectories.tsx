import { ReactNode, useCallback, useState } from 'react';

import SyncDirectory from '@renderer/models/SyncDirectory';
import PathService from '@renderer/services/PathService';
import { Button, IconClose, IconPlus } from 'fratch-ui';
import { c } from 'fratch-ui/helpers';

import { DirectorySelectOption } from '../../PackageSelector/PackageSelectorProps';
import type { DependencySelectorProps } from '../DependencySelectorProps';
import SyncDirectorySelector from './SyncDirectorySelector';

import styles from './SrcSyncDirectories.module.css';

const SRC_DEFAULT_DIR = 'src';

type SyncDirectoriesProps = Pick<
  DependencySelectorProps,
  'onSyncDirectoryChange' | 'dependency'
>;

export default function SyncDirectories({
  dependency,
  onSyncDirectoryChange,
}: SyncDirectoriesProps): JSX.Element {
  const cwd = dependency.cwd ?? '';
  const syncDirectoriesLength = dependency.syncDirectories?.length ?? 0;
  const initialSyncDirectories =
    syncDirectoriesLength > 0
      ? (dependency.syncDirectories as SyncDirectory[])
      : [new SyncDirectory(cwd)];

  const [syncDirectories, setSyncDirectories] = useState<SyncDirectory[]>(
    initialSyncDirectories
  );

  const onDirectoriesLoad = useCallback(
    (index: number, options: DirectorySelectOption[]): void => {
      if (syncDirectoriesLength > 0 || index > 0) {
        return;
      }

      let syncDirectory = new SyncDirectory(cwd);

      const hasSrc = options.some(({ value }) => value === SRC_DEFAULT_DIR);

      if (hasSrc) {
        const srcPath = PathService.getPath([
          ...PathService.getPathDirectories(cwd),
          SRC_DEFAULT_DIR,
        ]);
        syncDirectory = new SyncDirectory(srcPath);
      }

      const newSyncDirectories = [syncDirectory];
      setSyncDirectories(newSyncDirectories);
      onSyncDirectoryChange(dependency, newSyncDirectories);
    },
    [cwd, dependency, onSyncDirectoryChange, syncDirectoriesLength]
  );

  const handleAddSrcDirectory = (): void => {
    const newSyncDirectories = [
      ...(syncDirectories ?? []),
      new SyncDirectory(cwd),
    ];
    setSyncDirectories(newSyncDirectories);
    onSyncDirectoryChange(dependency, newSyncDirectories);
  };

  const handleRemoveSrcDirectory = (index: number): void => {
    let newSyncDirectories = (syncDirectories ?? []).filter(
      (_directory, itemIndex) => itemIndex !== index
    );

    if (newSyncDirectories.length === 0) {
      newSyncDirectories = [new SyncDirectory(cwd)];
    }

    setSyncDirectories(newSyncDirectories);
    onSyncDirectoryChange(dependency, newSyncDirectories);
  };

  const handleSyncDirectoryChange = (
    index: number,
    newSyncDirectory: SyncDirectory
  ): void => {
    const newSyncDirectories = (syncDirectories ?? []).map(
      (syncDirectory, itemIndex) =>
        itemIndex === index ? newSyncDirectory : syncDirectory
    );
    setSyncDirectories(newSyncDirectories);
    onSyncDirectoryChange(dependency, newSyncDirectories);
  };

  return (
    <div className={c(styles.sync_src)}>
      <p className={c(styles.sync_src_title)}>
        Source code directories to sync
      </p>
      {syncDirectories?.map<ReactNode>((syncDirectory, index) => {
        const showRemoveButton = syncDirectories.length > 1;
        const showAddButton = index === syncDirectories.length - 1;
        return (
          <SyncDirectorySelector
            key={`${syncDirectory.srcPath}_${index}`}
            dependency={dependency}
            index={index}
            onDirectoriesLoad={(options: DirectorySelectOption[]): void => {
              onDirectoriesLoad(index, options);
            }}
            onSyncDirectoryChange={(syncDirectory: SyncDirectory): void => {
              handleSyncDirectoryChange(index, syncDirectory);
            }}
            syncDirectory={syncDirectory}
            additionalComponent={
              <div className={c(styles.selector_buttons)}>
                {showRemoveButton && (
                  <Button
                    onClick={(event): void => {
                      event.preventDefault();
                      handleRemoveSrcDirectory(index);
                    }}
                    Icon={IconClose}
                    size="smaller"
                    isRound
                    label="Remove source code directory"
                  />
                )}

                {showAddButton && (
                  <Button
                    type="tertiary"
                    onClick={(event): void => {
                      event.preventDefault();
                      handleAddSrcDirectory();
                    }}
                    Icon={IconPlus}
                    size="smaller"
                    isRound
                    label="Add source code directory"
                  />
                )}
              </div>
            }
          />
        );
      })}
    </div>
  );
}
