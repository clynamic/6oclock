import { useUserHead } from '../api';
import { useAuth } from './context';

export const useCurrentUserHead = () => {
  const { payload } = useAuth();
  const userId = payload?.userId;

  return useUserHead(userId ?? 0, {
    query: {
      enabled: userId !== undefined,
    },
  });
};
