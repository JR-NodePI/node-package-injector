import NPMService from '@renderer/services/NPMService';
import TerminalService from '@renderer/services/TerminalService';
import { useEffect, useState } from 'react';
import CheckTerminalContext from './CheckTerminalContext';

export default function CheckTerminalProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
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

  return (
    <CheckTerminalContext.Provider value={{ loadingTerminal, isValidTerminal }}>
      {children}
    </CheckTerminalContext.Provider>
  );
}
