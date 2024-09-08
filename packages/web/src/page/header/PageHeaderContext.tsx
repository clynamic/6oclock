/* eslint-disable react-refresh/only-export-components */
import { PopupState } from "material-ui-popup-state/hooks";
import React, { createContext, ReactNode, useContext, useMemo } from "react";
import { NavigateFunction, useLocation, useNavigate } from "react-router-dom";

import { useCurrentBreakpoint } from "../../utils";
import { NavAction, NavNode, SubNavNode } from "../navigation";

export type PageHeaderLayout = "small" | "wide";

export interface PageHeaderContextValue {
  navigation: NavNode[];
  navigate: NavigateFunction;
  currentNavNode?: NavNode;
  currentSubNavNodes?: SubNavNode[];
  actions?: NavAction[];
  layout: PageHeaderLayout;
  popupState?: PopupState;
}

export const PageHeaderContext = createContext<PageHeaderContextValue | null>(
  null
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
  const layout = ["xs", "sm"].includes(currentBreakpoint) ? "small" : "wide";

  const location = useLocation();
  const navigate = useNavigate();

  const currentNavNode = useMemo(() => {
    const entry = navigation.find((nav) =>
      location.pathname.startsWith(nav.href)
    );
    return entry;
  }, [location.pathname, navigation]);

  const currentSubNavNodes = useMemo(() => {
    let result: SubNavNode[] | undefined;
    const segments = location.pathname.split("/");
    const entry = navigation.find((entry) =>
      entry.href
        .split("/")
        .every((segment, index) => segments[index] === segment)
    );
    if (entry) {
      result = entry.children;
    }
    return result;
  }, [location.pathname, navigation]);

  return (
    <PageHeaderContext.Provider
      value={{
        layout,
        navigation,
        navigate,
        currentNavNode,
        currentSubNavNodes,
        actions,
        popupState,
      }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
};

export const usePageHeaderContext = () => {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error(
      "usePageHeaderContext must be used within a PageHeaderProvider"
    );
  }
  return context;
};
