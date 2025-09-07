/* eslint-disable react-refresh/only-export-components */
import React, {
  PropsWithChildren,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from 'react';

import { PopupState } from 'material-ui-popup-state/hooks';
import { NavigateFunction, useLocation, useNavigate } from 'react-router-dom';

import { useCurrentBreakpoint } from '../../utils/breakpoints';
import {
  NavAction,
  NavNode,
  NavTopLink,
  SubNavNode,
  useFilterVisibleNavLinks,
  useResolveNavLinks,
} from '../navigation';
import { NavLinkVariant } from './NavItem';

export type PageHeaderLayout = 'small' | 'wide';

export interface PageHeaderContextValue {
  allEntries: NavNode[];
  visibleEntries: NavNode[];
  navigate: NavigateFunction;
  currentLink?: NavTopLink;
  currentSubLinks?: SubNavNode[];
  layout: PageHeaderLayout;
  popupState?: PopupState;
  section?: NavLinkVariant;
}

export const PageHeaderContext = createContext<PageHeaderContextValue | null>(
  null,
);

export interface PageHeaderProviderProps {
  children: ReactNode;
  entries: NavNode[];
  actions?: NavAction[];
  popupState?: PopupState;
}

export const PageHeaderProvider: React.FC<PageHeaderProviderProps> = ({
  children,
  entries,
  actions,
  popupState,
}) => {
  const currentBreakpoint = useCurrentBreakpoint();
  const layout = ['xs', 'sm'].includes(currentBreakpoint) ? 'small' : 'wide';

  const location = useLocation();
  const navigate = useNavigate();

  const allEntries = useResolveNavLinks(entries);
  const visibleEntries = useFilterVisibleNavLinks(allEntries);

  const currentLink = useMemo(() => {
    const entry = allEntries.find((entry): entry is NavTopLink => {
      if (entry instanceof Object && 'href' in entry) {
        const segments = location.pathname.split('/');
        return entry.href
          .split('/')
          .every((segment, index) => segments[index] === segment);
      }
      return false;
    });
    return entry;
  }, [location.pathname, allEntries]);

  const visibleSubLinks = useFilterVisibleNavLinks(currentLink?.children ?? []);

  const currentSubLinks = useMemo(() => {
    return [...(visibleSubLinks || []), ...(actions || [])];
  }, [actions, visibleSubLinks]);

  return (
    <PageHeaderContext.Provider
      value={{
        layout,
        allEntries,
        visibleEntries,
        navigate,
        currentLink,
        currentSubLinks,
        popupState,
      }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
};

export const PageHeaderReprovider: React.FC<
  PropsWithChildren<Partial<PageHeaderContextValue>>
> = ({ children, ...props }) => {
  const context = usePageHeaderContext();

  return (
    <PageHeaderContext.Provider value={{ ...context, ...props }}>
      {children}
    </PageHeaderContext.Provider>
  );
};

export const usePageHeaderContext = () => {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error(
      'usePageHeaderContext must be used within a PageHeaderProvider',
    );
  }
  return context;
};
