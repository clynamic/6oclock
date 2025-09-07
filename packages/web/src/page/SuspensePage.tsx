import { PropsWithChildren, Suspense } from 'react';

import { LoadingPage, LoadingPageProps } from './LoadingPage';

export const SuspensePage: React.FC<PropsWithChildren<LoadingPageProps>> = ({
  children,
  ...rest
}) => {
  return <Suspense fallback={<LoadingPage {...rest} />}>{children}</Suspense>;
};
