/* eslint-disable react-refresh/only-export-components */
import { PopupState } from 'material-ui-popup-state/hooks';
import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { NavigateFunction, useLocation, useNavigate } from 'react-router-dom';

import { useCurrentBreakpoint } from '../../utils/breakpoints';
import { NavAction, NavNode, NavTopLink, SubNavNode } from '../navigation';
import { NavLinkVariant } from './NavItem';

export type PageHeaderLayout = 'small' | 'wide';

export interface PageHeaderContextValue {
  navigation: NavNode[];
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
  navigation: NavNode[];
  actions?: NavAction[];
  popupState?: PopupState;
}

export const PageHeaderProvider: React.FC<PageHeaderProviderProps> = ({
  children,
  navigation,
  actions,
  popupState,
}) => {
  const currentBreakpoint = useCurrentBreakpoint();
  const layout = ['xs', 'sm'].includes(currentBreakpoint) ? 'small' : 'wide';

  const location = useLocation();
  const navigate = useNavigate();

  const currentLink = useMemo(() => {
    const entry = navigation.find((entry): entry is NavTopLink => {
      if (entry instanceof Object && 'href' in entry) {
        const segments = location.pathname.split('/');
        return entry.href
          .split('/')
          .every((segment, index) => segments[index] === segment);
      }
      return false;
    });
    return entry;
  }, [location.pathname, navigation]);

  const currentSubLinks = useMemo(() => {
    let result: SubNavNode[] | undefined;
    if (currentLink) {
      result = currentLink.children;
    }
    if (actions) {
      result = result ? [...result, ...actions] : actions;
    }
    return result;
  }, [actions, currentLink]);

  return (
    <PageHeaderContext.Provider
      value={{
        layout,
        navigation,
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
