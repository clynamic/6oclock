import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { AXIOS_INSTANCE } from '../http/axios';

interface SafeModeContextType {
  safeMode: boolean;
  setSafeMode: (enabled: boolean) => void;
}

const SafeModeContext = createContext<SafeModeContextType | undefined>(
  undefined,
);

export const useSafeMode = () => {
  const context = useContext(SafeModeContext);
  if (!context) {
    throw new Error('useSafeMode must be used within a SafeModeProvider');
  }
  return context;
};

const SAFE_MODE_STORAGE_KEY = 'safe_mode_enabled';

const setSafeModeHeader = (enabled: boolean) => {
  if (enabled) {
    AXIOS_INSTANCE.defaults.headers.common['x-safe-mode'] = 'true';
  } else {
    delete AXIOS_INSTANCE.defaults.headers.common['x-safe-mode'];
  }
};

export const SafeModeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [safeMode, setSafeModeState] = useState<boolean>(() => {
    const stored = localStorage.getItem(SAFE_MODE_STORAGE_KEY);
    return stored === 'true';
  });

  const setSafeMode = useCallback((enabled: boolean) => {
    setSafeModeState(enabled);
    localStorage.setItem(SAFE_MODE_STORAGE_KEY, enabled.toString());
    setSafeModeHeader(enabled);
  }, []);

  useEffect(() => {
    setSafeModeHeader(safeMode);
  }, [safeMode]);

  return (
    <SafeModeContext.Provider
      value={{
        safeMode,
        setSafeMode,
      }}
    >
      {children}
    </SafeModeContext.Provider>
  );
};
