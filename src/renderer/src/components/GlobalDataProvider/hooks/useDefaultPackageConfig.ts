import { useEffect, useState } from 'react';

import PackageConfig from '@renderer/models/PackageConfig';
import PathService from '@renderer/services/PathService';

export default function useDefaultPackageConfig(): {
  loadingDefaultPackage: boolean;
  defaultPackageConfig: PackageConfig;
} {
  const [loadingDefaultPackage, setIsLoading] = useState<boolean>(true);
  const [defaultPackageConfig, setDefaultPackageConfig] =
    useState<PackageConfig>(new PackageConfig());

  useEffect(() => {
    (async (): Promise<void> => {
      const newPackageConfig = defaultPackageConfig.clone();
      newPackageConfig.cwd = await PathService.getHomePath();
      setDefaultPackageConfig(newPackageConfig);
      setIsLoading(false);
    })();
  }, []);

  return {
    defaultPackageConfig,
    loadingDefaultPackage,
  };
}
