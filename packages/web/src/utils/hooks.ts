import { useState } from 'react';

/**
 * Like useEffect, but fires during render rather than after commit. Use when
 * the callback synchronizes one piece of state with another (e.g. resetting
 * derived state when a prop changes). React's set-state-in-effect lint
 * disallows that pattern in useEffect; this is the render-time equivalent.
 *
 * Semantics match useEffect: callback fires on mount and whenever deps change.
 */
export const useChangeEffect = (
  callback: () => void,
  deps: readonly unknown[],
): void => {
  const [prev, setPrev] = useState<readonly unknown[] | null>(null);
  if (
    prev === null ||
    prev.length !== deps.length ||
    prev.some((value, i) => !Object.is(value, deps[i]))
  ) {
    setPrev(deps);
    callback();
  }
};
