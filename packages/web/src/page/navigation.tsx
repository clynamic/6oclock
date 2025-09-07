/* eslint-disable react-refresh/only-export-components */
import { PropsWithChildren, createContext, useContext } from 'react';

export type NavNode = NavTopLink | NavAction;

export interface NavTopLink {
  label: React.ReactNode;
  href: string;
  children?: SubNavNode[];
  hidden?: boolean | (() => boolean);
  component?: React.ReactNode;
  resolve?: (href: string) => Record<string, string>;
}

export type SubNavNode = NavSubLink | NavAction;

export interface NavSubLink {
  label: React.ReactNode;
  href: string;
  hidden?: boolean | (() => boolean);
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

export const useResolveNavLinks = (entries: NavNode[]): NavNode[] => {
  const processEntries = (entryList: NavNode[]): NavNode[] => {
    return entryList
      .map((entry) => {
        if (entry instanceof Object && 'href' in entry) {
          const resolvedEntry = { ...entry };
          if ('resolve' in entry && entry.resolve) {
            const variables = entry.resolve(entry.href);
            resolvedEntry.href = resolveHref(entry.href, variables);
          }
          if ('children' in entry && entry.children) {
            resolvedEntry.children = processEntries(entry.children);
          }
          return resolvedEntry;
        }
        return entry;
      })
      .filter((entry) => {
        if (entry instanceof Object && 'href' in entry) {
          if (typeof entry.hidden === 'function') {
            return !entry.hidden();
          }
          return !entry.hidden;
        }
        return true;
      });
  };

  return processEntries(entries);
};
