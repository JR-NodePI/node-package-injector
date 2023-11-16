import { useState } from 'react';

import useDeepCompareEffect from 'use-deep-compare-effect';

import useExcludedDirectories from '../../GlobalDataProvider/useExcludedDirectories';
import type {
  DirectorySelectOption,
  useDirectorySelectOptionsProps,
} from './PackageSelectorProps';

const EXCLUDED_DIRECTORIES_NAMES = ['node_modules', 'dist', 'build'];

const getDirectorySelectOptions = async (
  cwd: string,
  excludedDirectories?: string[]
): Promise<DirectorySelectOption[]> => {
  const directories = await window.api.fs.readdir(cwd, {
    withFileTypes: true,
  });
  const filteredDirectories = directories
    .filter(
      dirent =>
        dirent.isDirectory() &&
        !/^(\.|_)/.test(dirent.name) &&
        !EXCLUDED_DIRECTORIES_NAMES.includes(dirent.name)
    )
    .filter(dirent => {
      const path = window.api.path.join(cwd, dirent.name, '/');
      return (excludedDirectories ?? []).includes(path) === false;
    })
    .map(dirent => ({ label: dirent.name, value: dirent.name }));

  return filteredDirectories;
};

export function useDirectorySelectOptions({
  cwd,
  onDirectoriesLoad,
}: useDirectorySelectOptionsProps): DirectorySelectOption[] {
  const [directoryOptions, setDirectoryOptions] = useState<
    DirectorySelectOption[]
  >([]);

  const excludedDirectories = useExcludedDirectories();

  useDeepCompareEffect(() => {
    const abortController = new AbortController();

    (async (): Promise<void> => {
      const options = await getDirectorySelectOptions(cwd, excludedDirectories);
      const timerId = setTimeout(() => {
        onDirectoriesLoad?.(options);
      }, 100);
      if (!abortController.signal.aborted) {
        setDirectoryOptions(options);
      } else {
        clearTimeout(timerId);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [cwd, excludedDirectories, onDirectoriesLoad]);

  return directoryOptions;
}
