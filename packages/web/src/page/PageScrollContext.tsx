import { createContext, useContext } from 'react';

export const PageScrollContext = createContext<HTMLElement | null>(null);

export const usePageScroll = () => useContext(PageScrollContext);
