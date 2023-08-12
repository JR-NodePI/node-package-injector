import { useState } from 'react';

import useExcludedDirectories from '../../GlobalDataProvider/useExcludedDirectories';
import type {
  DirectorySelectOption,
  useDirectorySelectOptionsProps,
} from './PackageSelectorProps';
import useEffectCWD from './useEffectCWD';

const getDirectorySelectOptions = async (
  cwd: string,
  excludedDirectories?: string[]
): Promise<DirectorySelectOption[]> => {
  const directories = await window.api.fs.readdir(cwd, {
    withFileTypes: true,
  });
  const filteredDirectories = directories
    .filter(dirent => dirent.isDirectory() && dirent.name[0] !== '.')
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

  useEffectCWD(() => {
    const abortController = new AbortController();

    (async (): Promise<void> => {
      const options = await getDirectorySelectOptions(cwd, excludedDirectories);
      const timerId = setTimeout(onDirectoriesLoad, 100);
      if (!abortController.signal.aborted) {
        setDirectoryOptions(options);
      } else {
        clearTimeout(timerId);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, cwd);

  return directoryOptions;
}
