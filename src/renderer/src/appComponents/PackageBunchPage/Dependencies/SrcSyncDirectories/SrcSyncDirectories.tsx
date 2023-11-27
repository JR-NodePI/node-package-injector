import { ReactNode, useCallback, useEffect, useState } from 'react';

import PathService from '@renderer/services/PathService';
// import { Button, IconClose, IconPlus } from 'fratch-ui';
import { c } from 'fratch-ui/helpers';

import { useDirectorySelectOptions } from '../../PackageSelector/useDirectorySelectOptions';
import type { DependencySelectorProps } from '../DependencySelectorProps';
import SrcSyncDirectory from './SrcSyncDirectory';

import styles from './SrcSyncDirectories.module.css';

const SRC_DEFAULT_DIR = 'src';

type SrcSyncDirectoriesProps = Pick<
  DependencySelectorProps,
  'onSrcSyncChange' | 'dependency'
>;

export default function SrcSyncDirectories({
  dependency,
  onSrcSyncChange,
}: SrcSyncDirectoriesProps): JSX.Element {
  const [srcDirectories, setSrcDirectories] = useState<undefined | string[]>(
    dependency.srcSyncDirectories
  );

  const cwd = dependency.cwd ?? '';

  useEffect(() => {
    if (cwd && srcDirectories?.length === 0) {
      setSrcDirectories([cwd]);
    }
  }, [cwd, srcDirectories]);

  const initialSrcDir = srcDirectories?.[0] ?? null;
  const onDirectoriesLoad = useCallback(
    (options): void => {
      if (initialSrcDir != null) {
        return;
      }

      const hasSrc = options.some(({ value }) => value === SRC_DEFAULT_DIR);
      if (hasSrc) {
        const newSrcDirectories = [
          PathService.getPath([
            ...PathService.getPathDirectories(cwd),
            SRC_DEFAULT_DIR,
          ]),
        ];
        setSrcDirectories(newSrcDirectories);
        onSrcSyncChange(dependency, newSrcDirectories);
      }
    },
    [initialSrcDir, cwd, onSrcSyncChange, dependency]
  );

  useDirectorySelectOptions({
    cwd,
    onDirectoriesLoad,
  });
  //
  //   const handleAddSrcDirectory = (): void => {
  //     const newSrcDirectories = [...(srcDirectories ?? []), ''];
  //     setSrcDirectories(newSrcDirectories);
  //     onSrcSyncChange(dependency, newSrcDirectories);
  //   };
  //
  //   const handleRemoveSrcDirectory = (index: number): void => {
  //     const newSrcDirectories = (srcDirectories ?? []).filter(
  //       (_directory, itemIndex) => itemIndex !== index
  //     );
  //     setSrcDirectories(newSrcDirectories);
  //     onSrcSyncChange(dependency, newSrcDirectories);
  //   };

  const handleSrcSyncChange = (index, newSrcDir): void => {
    const newSrcDirectories = (srcDirectories ?? []).map((srcDir, itemIndex) =>
      itemIndex === index ? newSrcDir : srcDir
    );
    setSrcDirectories(newSrcDirectories);
    onSrcSyncChange(dependency, newSrcDirectories);
  };

  //TODO: add relativeTargetSyncDir -> is where the src files will be copied
  //TODO: if relativeTargetSyncDir is undefined, the src files will be copied in the root src dependency
  //TODO: maybe a new component for this?

  return (
    <div className={c(styles.sync_src)}>
      <p className={c(styles.sync_src_title)}>
        Source code directories to sync
      </p>
      {srcDirectories?.map<ReactNode>((dir, index) => (
        // <div
        //   style={{ display: 'flex', alignItems: 'center' }}
        //   key={`${dir}_${index}`}
        // >
        <SrcSyncDirectory
          key={`${dir}_${index}`}
          dependency={dependency}
          srcSyncDirectory={dir}
          onSrcDirChange={(srcDir: string): void => {
            handleSrcSyncChange(index, srcDir);
          }}
        />
        //   <Button
        //     onClick={(event): void => {
        //       event.preventDefault();
        //       handleRemoveSrcDirectory(index);
        //     }}
        //     Icon={IconClose}
        //     size="smaller"
        //     isRound
        //     label="Remove source code directory"
        //   />
        //   <Button
        //     type="tertiary"
        //     onClick={(event): void => {
        //       event.preventDefault();
        //       handleAddSrcDirectory();
        //     }}
        //     Icon={IconPlus}
        //     size="smaller"
        //     isRound
        //     label="Add source code directory"
        //   />
        // </div>
      ))}
    </div>
  );
}
