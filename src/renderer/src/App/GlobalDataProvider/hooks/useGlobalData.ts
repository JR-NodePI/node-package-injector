import { useContext } from 'react';

import GlobalDataContext, { type GlobalDataProps } from '../GlobalDataContext';

export default function useGlobalData(): GlobalDataProps {
  return useContext(GlobalDataContext);
}
