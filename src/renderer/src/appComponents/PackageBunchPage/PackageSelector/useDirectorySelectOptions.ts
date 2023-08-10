import { useState } from 'react';

import useDeepCompareEffect from 'use-deep-compare-effect';

import useExcludedDirectories from '../../GlobalDataProvider/useExcludedDirectories';
import type {
  DirectorySelectOption,
  useDirectorySelectOptionsProps,
} from './PackageSelectorProps';

const getDirectorySelectOptions = async (
  cwd: string,
  excludedDirectories?: string[]
): Promise<DirectorySelectOption[]> => {
  const directories = await window.api.fs.readdir(cwd, { withFileTypes: true });
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

  useDeepCompareEffect(() => {
    getDirectorySelectOptions(cwd, excludedDirectories).then(options => {
      setDirectoryOptions(options);
      setTimeout(onDirectoriesLoad, 100);
    });
  }, [cwd, excludedDirectories]);

  return directoryOptions;
}
