/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";

export type NavNode = NavTopLink | NavAction;

export interface NavTopLink {
  label: React.ReactNode;
  href: string;
  children?: SubNavNode[];
}

export type SubNavNode = NavSubLink | NavAction;

export interface NavSubLink {
  label: React.ReactNode;
  href: string;
}

export type NavAction = React.ReactNode;

const NavigationEntryContext = createContext<NavNode[] | undefined>(undefined);

export interface NavigationEntryProviderProps {
  navigation: NavNode[];
  children: React.ReactNode;
}

export const NavigationEntryProvider: React.FC<
  NavigationEntryProviderProps
> = ({ navigation, children }) => {
  return (
    <NavigationEntryContext.Provider value={navigation}>
      {children}
    </NavigationEntryContext.Provider>
  );
};

export const useNavigationEntries = (): NavNode[] => {
  const context = useContext(NavigationEntryContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};
