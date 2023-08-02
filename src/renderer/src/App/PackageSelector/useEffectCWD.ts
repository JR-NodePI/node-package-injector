import { useEffect } from 'react';

export default function useEffectCWD(
  effect: React.EffectCallback,
  cwd: string
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => effect?.(), [cwd]);
}
