import React from 'react';

export type CheckTerminalProps = {
  loadingTerminal?: boolean;
  isValidTerminal?: boolean;
};
const CheckTerminalContext = React.createContext<CheckTerminalProps>({});

export default CheckTerminalContext;
