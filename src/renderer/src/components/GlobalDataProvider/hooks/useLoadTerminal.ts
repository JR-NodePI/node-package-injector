import { useEffect, useState } from 'react';

import NPMService from '@renderer/services/NPMService';
import TerminalService from '@renderer/services/TerminalService';

const useLoadTerminal = (): {
  loadingTerminal: boolean;
  isValidTerminal: boolean;
} => {
  const [loadingTerminal, setIsLoading] = useState<boolean>(true);
  const [isValidTerminal, setIsValid] = useState<boolean>(true);

  useEffect(() => {
    (async (): Promise<void> => {
      const hasTerminal = await TerminalService.init(window.api.os.homedir());
      const isValidNode = hasTerminal && (await NPMService.checkNodeNpmYarn());

      setIsValid(isValidNode);
      setIsLoading(false);
    })();
  }, []);

  return { loadingTerminal, isValidTerminal };
};

export default useLoadTerminal;
