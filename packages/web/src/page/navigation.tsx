/* eslint-disable react-refresh/only-export-components */
import { createContext, PropsWithChildren, useContext } from 'react';

export type NavNode = NavTopLink | NavAction;

export interface NavTopLink {
  label: React.ReactNode;
  href: string;
  children?: SubNavNode[];
  hidden?: boolean;
  component?: React.ReactNode;
  resolve?: (href: string) => Record<string, string>;
}

export type SubNavNode = NavSubLink | NavAction;

export interface NavSubLink {
  label: React.ReactNode;
  href: string;
  hidden?: boolean;
  component?: React.ReactNode;
  resolve?: (href: string) => Record<string, string>;
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

export const resolveHref = (
  href: string,
  variables: Record<string, string>,
): string => {
  return href.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, key) => {
    if (key in variables) {
      return variables[key];
    }
    console.warn(`Missing variable for key: ${key}`);
    return match;
  });
};

export const resolveNavLinks = (entries: NavNode[]): NavNode[] => {
  return entries.map((entry) => {
    if (entry instanceof Object && 'resolve' in entry && entry.resolve) {
      const variables = entry.resolve(entry.href);
      return {
        ...entry,
        href: resolveHref(entry.href, variables),
      };
    }
    if (
      entry instanceof Object &&
      'href' in entry &&
      'children' in entry &&
      entry.children
    ) {
      return {
        ...entry,
        children: resolveNavLinks(entry.children),
      };
    }
    return entry;
  });
};
