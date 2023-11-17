import { useEffect, useState } from 'react';

import PathService from '@renderer/services/PathService';

const useLoadHomePath = ({
  isWSLActive,
}: {
  isWSLActive: boolean;
}): {
  homePath: string;
  isHomePathLoading: boolean;
} => {
  const [isHomePathLoading, setLoading] = useState<boolean>(true);
  const [homePath, setHomePath] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    (async (): Promise<void> => {
      setHomePath(await PathService.getHomePath(isWSLActive));
      setLoading(false);
    })();
  }, [isWSLActive]);

  return {
    homePath,
    isHomePathLoading,
  };
};

export default useLoadHomePath;
