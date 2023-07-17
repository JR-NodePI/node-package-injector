import { useContext } from 'react';
import CheckTerminalContext, {
  type CheckTerminalProps,
} from './CheckTerminalContext';

export default function useCheckTerminal(): CheckTerminalProps {
  return useContext(CheckTerminalContext);
}
