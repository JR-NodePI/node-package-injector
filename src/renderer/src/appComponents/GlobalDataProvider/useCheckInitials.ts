import { useEffect, useState } from 'react';

import NPMService from '@renderer/services/NPMService';
import TerminalService from '@renderer/services/TerminalService';

const useCheckInitials = (): {
  isValidTerminalLoading: boolean;
  isValidTerminal: boolean;
  nodeData: Record<string, string>;
} => {
  const [isValidTerminalLoading, setIsLoading] = useState<boolean>(true);
  const [isValidTerminal, setIsValid] = useState<boolean>(true);
  const [nodeData, setNodeData] = useState<Record<string, string>>({});

  useEffect(() => {
    (async (): Promise<void> => {
      const hasTerminal = await TerminalService.init(window.api.os.homedir());
      const nodeData = await NPMService.getNodeNpmYarn();

      const isValidNode =
        hasTerminal && nodeData?.node != null && nodeData?.npm != null;

      setNodeData(nodeData);
      setIsValid(isValidNode);
      setIsLoading(false);
    })();
  }, []);

  return { nodeData, isValidTerminalLoading, isValidTerminal };
};

export default useCheckInitials;
