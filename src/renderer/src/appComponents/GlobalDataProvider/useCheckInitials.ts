import { useEffect, useState } from 'react';

import NPMService from '@renderer/services/NPMService';
import TerminalService from '@renderer/services/TerminalService';

const useCheckInitials = (): {
  isGlobalLoading: boolean;
  isValidTerminal: boolean;
  nodeData: Record<string, string>;
  setIsGlobalLoading: React.Dispatch<React.SetStateAction<boolean>>;
} => {
  const [isGlobalLoading, setIsLoading] = useState<boolean>(true);
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

  return {
    nodeData,
    isGlobalLoading,
    isValidTerminal,
    setIsGlobalLoading: setIsLoading,
  };
};

export default useCheckInitials;
