/* eslint-disable react-refresh/only-export-components */
import { createContext, PropsWithChildren, useContext } from 'react';

export type NavNode = NavTopLink | NavAction;

export interface NavTopLink {
  label: React.ReactNode;
  href: string;
  children?: SubNavNode[];
  component?: React.ReactNode;
}

export type SubNavNode = NavSubLink | NavAction;

export interface NavSubLink {
  label: React.ReactNode;
  href: string;
  component?: React.ReactNode;
}

export type NavAction = React.ReactNode;

const NavigationEntryContext = createContext<NavNode[] | undefined>(undefined);

export interface NavigationEntryProviderProps extends PropsWithChildren {
  entries: NavNode[];
}

export const NavigationEntryProvider: React.FC<
  NavigationEntryProviderProps
> = ({ entries, children }) => {
  return (
    <NavigationEntryContext.Provider value={entries}>
      {children}
    </NavigationEntryContext.Provider>
  );
};

export const useNavigationEntries = (): NavNode[] => {
  const context = useContext(NavigationEntryContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
